// Kizrak

'use strict';

const log = require('log').log;
const JSS = JSON.stringify;

Number.prototype.toFixedNumber = function (digits, base)
{
	// https://stackoverflow.com/a/29494612/
	const pow = Math.pow(base || 10, digits);
	return Math.round(this * pow) / pow;
}

RoomPosition.prototype.distanceC = function (other)
{
	const otherPos = other.pos || other;

	if (this.room != otherPos.room)
	{
		const msg = "Rooms must be the same for RoomPosition::distanceToPos\n" + this.room + '\n' + otherPos.room;
		log(msg);
		return Infinity;
	}

	const x2x = Math.abs(this.x - otherPos.x);
	const y2y = Math.abs(this.y - otherPos.y);
	const distance = Math.sqrt(x2x * x2x + y2y * y2y);

	return distance;
}

RoomPosition.prototype.distance = function (other)
{
	const otherPos = other.pos || other;

	if (this.room != otherPos.room)
	{
		const msg = "Rooms must be the same for RoomPosition::distanceToPos\n" + this.room + '\n' + otherPos.room;
		log(msg);
		return Infinity;
	}

	const x2x = Math.abs(this.x - otherPos.x);
	const y2y = Math.abs(this.y - otherPos.y);
	const distance = x2x + y2y;

	return distance;
}

Creep.prototype.recycle = function ()
{
	this.say("💀");

	if (this.spawning)
	{
		log("trying to recycle spawning creep " + this.href());
		return;
	}

	const spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);

	if (!spawn)
	{
		log("trying to recycle creep without spawner " + this.href());
		return;
	}

	this.travel(spawn);

	const recycleResult = spawn.recycleCreep(this);

	if (OK == recycleResult)
	{
		console.log("Creep.recycle", this.href(), JSS(this));
	}
	else if (ERR_NOT_IN_RANGE == recycleResult)
	{}
	else if (ERR_INVALID_TARGET == recycleResult)
	{
		console.log('recycleResult', 'ERR_INVALID_TARGET', this.href(), spawn.href());
	}
	else
	{
		console.log('recycleResult', recycleResult, this.href(), spawn.href());
	}
}

Creep.prototype.smartWithdraw = function (target, resourceType = RESOURCE_ENERGY, say = "⚡")
{
	const withdrawResult = this.withdraw(target, resourceType);

	if (ERR_NOT_IN_RANGE == withdrawResult)
	{
		this.say(say);
		const moveResult = this.travel(target);
	}
	else if (OK == withdrawResult)
	{
		// acceptable
		this.say(say);
	}
	else
	{
		this.say("💫" + withdrawResult);
	}

	return withdrawResult
}

Creep.prototype.travel = function (target, opts)
{
	opts = opts ||
	{
		visualizePathStyle:
		{
			stroke: '#ffaa00'
		}
	};

	if (target.room && this.room != target.room)
	{
		log("Creep-room-travel-transfer", this.href(), this.room.href(), target.room.href());
	}

	const moveResult = this.moveTo(target, opts);

	if (OK == moveResult || ERR_TIRED == moveResult)
	{
		// acceptable
		return OK;
	}
	else if (ERR_NO_PATH == moveResult)
	{
		this.say('🚫');

		const creepAreaCreepsCount = this.pos.findInRange(FIND_MY_CREEPS, 1.9).length - 1;
		const targetAreaCreepsCount = target.pos.findInRange(FIND_MY_CREEPS, 1.9).length;

		const distance = this.pos.distance(target.pos);

		if (creepAreaCreepsCount > 0 && targetAreaCreepsCount > 0 && distance < 3)
		{
			// hopefully just congestion
		}
		else if (creepAreaCreepsCount + targetAreaCreepsCount >= 1 && distance < 3)
		{
			// hopefully just congestion
		}
		else
		{
			const msg = 'Creep.prototype.travel No path to the target could be found. ' + this.room.href() + ' ' + this.href() + ' ' + target.href() + ' ' + target.room.href() + ' ' + creepAreaCreepsCount + ' ' + targetAreaCreepsCount + ' ' + distance;
			if (target instanceof Source)
			{
				log("Creep.prototype.travel instanceof Source", msg);
			}
			else
			{
				log(msg);
			}
		}
	}
	else if (ERR_INVALID_TARGET == moveResult)
	{
		this.say('🛑');
		log('Creep.prototype.travel ' + this.href() + ' ERR_INVALID_TARGET ' + JSON.stringify(target));
	}
	else
	{
		this.say('🛑');
		log('Creep.prototype.travel ' + this.href() + ' ' + target + ' ' + moveResult);
	}

	return moveResult;
}

Creep.prototype.gotoFlag = function (flag)
{
	const flagRoomName = flag.pos.roomName;
	const flagRoom = Game.rooms[flagRoomName];

	if (!flagRoom)
	{
		this.say("🥇🚩");
		this.travel(flag);
		return true;
	}
	else if (flagRoom != this.room)
	{
		this.say("🚩");
		this.travel(flag);
		return true;
	}
	else
	{
		this.say("⛳");
		// this.travel(flag);
		return false;
	}
}

Creep.prototype.bodyScan = function (scan_type)
{
	for (const part of this.body)
	{
		if (part.type == scan_type)
		{
			return true;
		}
	}
	return false;
}

Creep.prototype.smartTransfer = function (target, say = "🔋", resource = RESOURCE_ENERGY)
{
	const transferResult = this.transfer(target, resource);

	if (ERR_NOT_IN_RANGE == transferResult)
	{
		this.say(say);
		this.travel(target);
	}
	else if (OK == transferResult)
	{
		this.say(say);
	}
	else if (ERR_INVALID_TARGET == transferResult)
	{
		this.say("🥛");
		const msg = 'transferResult The target is not a valid object which can contain the specified resource. ' + target;
		log(msg);
	}
	else if (ERR_NOT_ENOUGH_RESOURCES == transferResult)
	{
		this.say("🥛");
		const msg = 'transferResult The creep does not have the given amount of resources. ' + target + ' ' + this.room.href();
		log(msg);
	}
	else if (ERR_FULL == transferResult)
	{
		this.say("🥛");
		const msg = 'transferResult The target cannot receive any more resources. ' + this.href() + ' ' + target.href();
		log(msg);
	}
	else
	{
		this.say("🥛");
		log('transferResult ' + transferResult);
	}
}

Creep.prototype.smartBuild = function (structure, say = "🚧")
{
	const buildResult = this.build(structure);

	if (ERR_NOT_IN_RANGE == buildResult)
	{
		this.say(say);
		this.travel(structure);
	}
	else if (OK == buildResult)
	{
		this.say(say);
	}
	else if (ERR_BUSY == buildResult)
	{
		this.say("🐣");
	}
	else if (ERR_NOT_ENOUGH_RESOURCES == buildResult)
	{
		this.say("🔌");
		log('The creep does not have any carried energy. ' + this.room.href());
	}
	else if (ERR_INVALID_TARGET == buildResult)
	{
		this.say("💫" + "🚧");
		console.log('smartBuild ERR_INVALID_TARGET ' + this.href() + '  ' + JSS(structure));
	}
	else
	{
		log('creep-build-failed ' + buildResult + ' ' + this.room.href());
		this.say("💫" + buildResult);
	}
}

Creep.prototype.smartHarvest = function (source, say = "🌿")
{
	const harvestResult = this.harvest(source);

	if (ERR_NOT_IN_RANGE == harvestResult)
	{
		this.say(say);
		this.travel(source);
	}
	else if (OK == harvestResult)
	{
		this.say(say);
	}
	else if (ERR_BUSY == harvestResult)
	{
		// ignore "The creep is still being spawned."
	}
	else if (ERR_TIRED == harvestResult && source instanceof Mineral)
	{
		// ignore: The extractor or the deposit is still cooling down.
	}
	else if (ERR_NOT_ENOUGH_RESOURCES == harvestResult)
	{
		this.say("💢");
		log("The target does not contain any harvestable energy or mineral. " + this.room.href());
	}
	else if (ERR_NO_BODYPART == harvestResult)
	{
		this.say("💢🔨");
		log("There are no WORK body parts in this creep’s body. " + this.room.href());
	}
	else
	{
		this.say("💢🌿");
		log("creep.harvest = " + harvestResult + ' ' + this.room.href());
	}
}

Creep.prototype.smartExtract = function ()
{
	this.say("⛏️");
	const mineral = this.room.getMineral();
	this.smartHarvest(mineral, "⛏️");
}

Creep.prototype.melee = function ()
{
	const enemyCreep = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

	// TODO: target towers first?
	const enemyBuilding = this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);

	if (enemyBuilding)
	{
		this.say("⚔️");
		this.travel(enemyBuilding);
		this.attack(enemyBuilding);
	}

	if (enemyCreep)
	{
		if (this.distance(enemyCreep) <= 1)
		{
			this.say("🗡️");
		}
		this.attack(enemyBuilding);
	}

	return enemyBuilding || enemyCreep;
}

Room.prototype.getMineral = function ()
{
	const minerals = this.find(FIND_MINERALS);

	if (minerals && minerals.length == 1)
	{
		return minerals[0];
	}
	else
	{
		console.log('cannot-find-minerals', this.href(), minerals);
	}
}

// TODO: Room.smartSpawnCreepNear(pos)
Room.prototype.smartSpawnCreep = function (data, body, givenName)
{
	const spawns = this.find(FIND_MY_SPAWNS,
		{
			filter: (spawn) =>
			{
				const spawning = spawn.spawning;
				return !spawning;
			}
		}
		);

	if (spawns.length > 0)
	{
		// TODO: Random?
		return spawns[0].smartSpawnCreep(data, body, givenName);
	}
}

Room.prototype.smartSpawnRole = function (data, baseBody, givenName)
{
	function bodyCost(body)
	{
		// https://stackoverflow.com/a/41194993
		return body.reduce(function (cost, part)
		{
			return cost + BODYPART_COST[part];
		}, 0);
	}

	function getBody(desiredCopies)
	{
		const min = Math.floor(50 / baseBody.length);
		const copies = Math.min(desiredCopies, min);

		const body = new Array(copies).fill(baseBody).flat();

		return body;
	}

	const cost = bodyCost(baseBody);

	const copies = this.idealEnergyRatio(cost);

	if (copies)
	{
		const body = getBody(copies);

		return this.smartSpawnCreep(data, body, givenName);
	}
}

Room.prototype.deconstructWallRamparts = function ()
{
	const walls = this.findStructuresByType(STRUCTURE_WALL);

	for (const wall of Object.values(walls))
	{
		const lookResults = wall.pos.lookFor(LOOK_STRUCTURES);
		for (const structure of Object.values(lookResults))
		{
			const structureType = structure.structureType;
			if (STRUCTURE_RAMPART == structureType)
			{
				console.log("WALL-RAMPART-DESTROY", structure);
				structure.destroy();
			}
		}
	}
}

Room.prototype.idealEnergyRatio = function (value)
{
	const energyAvailableRatio = Math.floor(this.energyAvailable / value);
	const energyCapacityAvailableRatio = Math.floor(this.energyCapacityAvailable / value);

	if (energyAvailableRatio == energyCapacityAvailableRatio)
	{
		return energyAvailableRatio;
	}
}

Room.prototype.getMostEnergySource = function ()
{
	const sources = this.find(FIND_SOURCES);

	var most =
	{
		energy: -1
	};

	for (const[idx, source]of Object.entries(sources))
	{
		if (source.energy > most.energy)
		{
			most = source;
		}
	}

	if (most.energy >= 0)
	{
		return most;
	}
	else
	{
		log("Unable to find source in " + this.href());
		return null;
	}
}

Creep.prototype.pickSource = function ()
{
	const sourceBestOptions = []

	sourceBestOptions.push(this.pos.findClosestByPath(FIND_SOURCES_ACTIVE));
	sourceBestOptions.push(this.room.getMostEnergySource());

	const source = sourceBestOptions[Math.floor(Math.random() * sourceBestOptions.length)];

	if (!source)
	{
		var next =
		{
			ticksToRegeneration: Infinity
		};

		const sources = this.room.find(FIND_SOURCES);

		for (const[idx, source]of Object.entries(sources))
		{
			if (source.ticksToRegeneration < next.ticksToRegeneration)
			{
				next = source;
			}
		}

		if (next.ticksToRegeneration < Infinity)
		{
			return next;
		}
	}

	return source;
}

Creep.prototype.findStructureThatNeedEnergy = function ()
{
	const room = this.room;

	const target = this.pos.findClosestByPath(FIND_MY_STRUCTURES,
		{
			filter: (structure) =>
			{
				const store = structure.store;
				if (!store)
				{
					return false;
				}

				const freeCap = structure.store.getFreeCapacity(RESOURCE_ENERGY);
				if (freeCap <= 0)
				{
					return false;
				}

				const structureType = structure.structureType;

				const isSpawn = STRUCTURE_SPAWN == structureType;
				const isExtension = STRUCTURE_EXTENSION == structureType;
				if (isSpawn || isExtension)
				{
					return true;
				}

				const isLink = STRUCTURE_LINK == structureType;
				if (isLink)
				{
					const linkGoal = structure.getGoalType();
					if ("sink" == linkGoal)
					{
						return freeCap >= 50;
					}
				}

				// TODO: other buildings???
				return false;
			}
		}
		);

	return target;
}

Creep.prototype.smartUpgradeController = function (say = "⏫")
{
	this.say(say);

	const upgradeResult = this.upgradeController(this.room.controller);

	if (ERR_NOT_IN_RANGE == upgradeResult)
	{
		this.travel(this.room.controller);
	}
	else if (OK == upgradeResult)
	{}
	else
	{
		this.say("👺");
		console.log("upgradeResult", upgradeResult, this.href());
	}
}

Room.prototype.getCreeps = function (role, size = 0)
{
	return this.find(FIND_MY_CREEPS,
	{
		filter: (creep) =>
		{
			const creepRole = creep.memory.role;
			const creepSize = creep.body.length;

			return role == creepRole && creepSize >= size;
		}
	}
	);
}

StructureLink.prototype.getGoalType = function ()
{
	// "sink"
	// "fountain"
	return Memory.links[this.room.name][this.id].goal;
}

StructureController.prototype.getLevel = function ()
{
	const fraction = this.progress / this.progressTotal;
	const level = this.level + (fraction || 0);

	return level;
}

StructureTower.prototype.repairNonDefense = function ()
{
	const damagedStructures = this.room.find(FIND_STRUCTURES,
		{
			filter: (structure) =>
			{
				const structureType = structure.structureType;

				if (STRUCTURE_WALL == structureType || STRUCTURE_RAMPART == structureType)
				{
					return false;
				}

				return structure.missingHits() > 800 * 6 && structure.percentHits() < 0.60;
			}
		}
		);

	this.smartRepair(damagedStructures);
}

StructureTower.prototype.repairWeakNonRoads = function ()
{
	const damagedStructures = this.room.find(FIND_STRUCTURES,
		{
			filter: (structure) =>
			{
				const structureType = structure.structureType;

				if (STRUCTURE_ROAD == structureType)
				{
					return false;
				}

				if (structure.hits > 15_000)
				{
					return false;
				}

				return structure.missingHits() >= 50;
			}
		}
		);

	this.smartRepair(damagedStructures);
}

StructureTower.prototype.repairRoads = function ()
{
	const damagedRoad = this.pos.findClosestByRange(FIND_STRUCTURES,
		{
			filter: (structure) =>
			{
				const structureType = structure.structureType;

				if (STRUCTURE_ROAD != structureType)
				{
					return false;
				}

				return structure.missingHits() > 800 && structure.percentHits() <= 0.68;
			}
		}
		);

	this.smartRepair(damagedRoad);
}

StructureTower.prototype.repairDefenses = function (hits = 300_000)
{
	const damagedStructures = this.room.find(FIND_STRUCTURES,
		{
			filter: (structure) =>
			{
				const structureType = structure.structureType;

				if (STRUCTURE_WALL == structureType || STRUCTURE_RAMPART == structureType)
				{
					return structure.hits < hits && structure.missingHits() > (800 * 6);
				}
				else
				{
					return false;
				}
			}
		}
		);

	this.smartRepair(damagedStructures);
}

// if given an array, repairs the weakest
StructureTower.prototype.smartRepair = function (input)
{
	if (input == null)
	{
		return;
	}
	else if (input instanceof Array && input.length == 0)
	{
		return;
	}

	function getStructureFromInputOrArrayInput()
	{
		if (input instanceof Array)
		{
			var weakest =
			{
				hits: Infinity
			};

			for (const[idx, structure]of Object.entries(input))
			{
				if (structure instanceof Structure)
				{
					if (structure.hits < weakest.hits)
					{
						weakest = structure;
					}
				}
				else
				{
					console.log('smartRepair-array-unknown', structure);
				}
			}

			return weakest;
		}
		else if (input instanceof Structure)
		{
			return input;
		}
		else
		{
			console.log('smartRepair-unknown', input);
		}
	}

	const target = getStructureFromInputOrArrayInput();

	const repairResult = this.repair(target);

	if (OK == repairResult)
	{}
	else
	{
		console.log('smartRepair', this.href(), repairResult, target, target.structureType);
	}
}

Room.prototype.findConstructionByType = function (structureType)
{
	const structures = this.find(FIND_CONSTRUCTION_SITES,
		{
			filter:
			{
				structureType: structureType
			}
		}
		);
	return structures;
}

Room.prototype.findStructuresByType = function (structureType)
{
	const structures = this.find(FIND_STRUCTURES,
		{
			filter:
			{
				structureType: structureType
			}
		}
		);
	return structures;
}

Room.prototype.findMyStructuresByType = function (structureType)
{
	const structures = this.find(FIND_MY_STRUCTURES,
		{
			filter:
			{
				structureType: structureType
			}
		}
		);
	return structures;
}

Room.prototype.checkConstructablesAvailable = function ()
{
	const controller = this.controller;

	const level = controller.level;

	console.log(controller.href((this + "-" + level).padStart(20)));

	for (const[structureType, limits]of Object.entries(CONTROLLER_STRUCTURES))
	{
		if (
			STRUCTURE_WALL == structureType ||
			STRUCTURE_ROAD == structureType ||
			STRUCTURE_RAMPART == structureType ||
			STRUCTURE_WALL == structureType)
		{}
		else
		{
			const limit = limits[level];
			const built = this.findStructuresByType(structureType).length;
			const building = this.findConstructionByType(structureType).length;
			const available = limit - (built + building);
			if (available > 0)
			{
				console.log(structureType.padStart(20), available);
			}
		}
	}
}

RoomObject.prototype.missingHits = function ()
{
	return this.hitsMax - this.hits;
}

RoomObject.prototype.percentHits = function ()
{
	return this.hits / this.hitsMax;
}

const namingMap =
{
	move: "M",
	work: "W",
	carry: "C",
	attack: "A",
	ranged_attack: "R",
	tough: "T",
	heal: "H",
	claim: "L",
}

StructureSpawn.prototype.smartSpawnCreep = function (data, body, givenName)
{
	if (this.spawning)
	{
		return;
	}

	function getBodyMap()
	{
		const bodyMap = {}

		for (const[idx, part]of Object.entries(body))
		{
			if (!(part in bodyMap))
			{
				bodyMap[part] = 0;
			}
			bodyMap[part] = 1 + bodyMap[part];
		}

		return bodyMap;
	}

	function getNameFromBody(bodyMap)
	{
		var newName = '';

		const namer = Object.keys(bodyMap).map(function (key)
			{
				return [key, bodyMap[key] / body.length];
			}
			).sort(function (a, b)
			{
				return b[1] - a[1];
			}
			);

		namer.forEach(kv =>
		{
			const bodyType = kv[0];
			const percent = kv[1];
			const bodyChar = namingMap[bodyType];

			newName += namingMap[kv[0]];
		}
		);

		const tickName = ('' + (Game.time % 10_000)).padStart(4, '0');

		newName = newName + '-' + tickName;
		return newName;
	}

	const bodyMap = getBodyMap();

	const name = givenName || getNameFromBody(bodyMap);

	function getCreepMemory()
	{
		if (typeof data === 'string' || data instanceof String)
		{
			var m =
			{
				role: data,
			};
			return m;
		}
		else
		{
			return data;
		}
	}

	const memory = getCreepMemory();

	//console.log(JSS(memory));

	const spawnResult = this.spawnCreep(body, name,
		{
			memory: memory,
		}
		);

	if (ERR_NOT_ENOUGH_ENERGY == spawnResult)
	{
		console.log("smartSpawnCreep", "ERR_NOT_ENOUGH_ENERGY", this.href(), JSS(bodyMap), JSS(memory));
	}
	else if (ERR_BUSY == spawnResult && this.spawning)
	{
		// ignore
	}
	else if (ERR_NAME_EXISTS == spawnResult)
	{
		if (givenName)
		{
			console.log('There is a creep with the same name already.', givenName);
		}
		// ignore: There is a creep with the same name already.
	}
	else if (ERR_BUSY == spawnResult)
	{
		console.log('The spawn is already in process of spawning another creep.', JSS(memory));
	}
	else if (OK == spawnResult)
	{
		console.log(this.room.href(), 'Spawning:', name, this.href(), this.room.energyAvailable, this.room.energyCapacityAvailable, JSON.stringify(memory), JSON.stringify(bodyMap));
	}
	else if (ERR_INVALID_ARGS == spawnResult)
	{
		var key = 'spawnResult ERR_INVALID_ARGS ' + body.length + '  ' + JSS(memory) + '  ' + JSS(body);
		var msg = 'spawnResult ERR_INVALID_ARGS ' + body.length + '  ' + JSS(memory) + '  ' + JSS(body) + JSS(name);
		log(key, msg);
	}
	else
	{
		console.log('spawnResult', spawnResult);
	}
}

StructureSpawn.prototype.visualize = function ()
{
	if (this.spawning)
	{
		const spawningCreep = Game.creeps[this.spawning.name];
		this.room.visual.text(
			'🛠️' + spawningCreep.memory.role,
			this.pos.x + 1,
			this.pos.y,
		{
			align: 'left',
			opacity: 0.8
		}
		);
	}
}

StructureLab.prototype.isFull = function ()
{
	return this.store.getFreeCapacity(this.mineralType) <= 5;
}

StructureLab.prototype.isLow = function ()
{
	return this.store[this.mineralType] < 300;
}

StructureLab.prototype.isFree = function ()
{
	if (!this.mineralType)
	{
		return true;
	}
	return this.store.getFreeCapacity(this.mineralType) >= 1250;
}

StructureLab.prototype.smartRunReaction = function (lab1, lab2)
{
	if (lab1.isLow() || lab2.isLow())
	{}
	else if (this.isFull())
	{}
	else if (this.cooldown > 0)
	{}
	else
	{
		const reactionResult = this.runReaction(lab1, lab2);

		if (OK == reactionResult)
		{
			// OK	0	The operation has been scheduled successfully.
		}
		else
		{
			console.log('smartRunReaction', this.href(), reactionResult);
		}
	}
}

Room.prototype.getAdjacentVisibleRooms = function ()
{
	const exits = Game.map.describeExits(this.name);
	const rooms = [];

	for (const roomName of Object.values(exits))
	{
		const room = Game.rooms[roomName];
		if (room)
		{
			rooms.push(room);
		}
	}

	return rooms;
}

Room.prototype.constructRamparts = function ()
{
	const structures = this.find(FIND_STRUCTURES,
		{
			filter: (structure) =>
			{
				const structureType = structure.structureType;
				if (STRUCTURE_ROAD == structureType)
				{
					return false;
				}
				if (STRUCTURE_RAMPART == structureType)
				{
					return false;
				}
				if (STRUCTURE_EXTENSION == structureType)
				{
					return false;
				}
				if (STRUCTURE_WALL == structureType)
				{
					return false;
				}
				if (STRUCTURE_CONTROLLER == structureType)
				{
					return false;
				}
				if (STRUCTURE_EXTRACTOR == structureType)
				{
					return false;
				}
				return true;
			}
		}
		);

	for (const structure of Object.values(structures))
	{
		structure.checkConstructRampart();
	}
}

RoomObject.prototype.checkConstructRampart = function ()
{
	const structures = this.pos.lookFor(LOOK_STRUCTURES);

	for (const structure of Object.values(structures))
	{
		const structureType = structure.structureType;
		if (STRUCTURE_RAMPART == structureType)
		{
			return;
		}
	}

	this.constructRampart();
}

RoomObject.prototype.constructRampart = function ()
{
	const createSiteResult = this.room.createConstructionSite(this.pos, STRUCTURE_RAMPART);

	if (OK == createSiteResult)
	{
		console.log('Constructing-Rampart', this.href());
	}
	else if (ERR_INVALID_TARGET == createSiteResult)
	{
		console.log('constructRampart', 'ERR_INVALID_TARGET', this.href());
	}
	else
	{
		console.log('constructRampart', createSiteResult, this.href());
	}
}

RoomObject.prototype.percentStoreFull = function (resource = undefined)
{
	const capacity = this.store.getCapacity(resource);
	const usedCapacity = this.store.getUsedCapacity(resource);

	return usedCapacity / capacity;
}

// href

Room.prototype.href = function (msg = this.name)
{
	const roomName = this.name;
	return '<a href="#!/room/' + roomName + '">' + msg + '</a>'
}

RoomObject.prototype.href = function (msg = this)
{
	const roomName = this.room.name;
	return '<a href="#!/room/' + roomName + '">' + msg + '</a>'
}

RoomPosition.prototype.href = function (msg = this)
{
	const roomName = this.room.name;
	return '<a href="#!/room/' + roomName + '">' + msg + '</a>'
}
