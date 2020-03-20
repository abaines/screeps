// Kizrak

'use strict';

const log = require('log').log;

Number.prototype.toFixedNumber = function (digits, base)
{
	// https://stackoverflow.com/a/29494612/
	const pow = Math.pow(base || 10, digits);
	return Math.round(this * pow) / pow;
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
	const distance = Math.sqrt(x2x * x2x + y2y * y2y);

	return distance;
}

Creep.prototype.recycle = function ()
{
	this.say("💀");
	const spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);
	this.travel(spawn);

	const recycleResult = spawn.recycleCreep(this);

	if (OK == recycleResult || ERR_NOT_IN_RANGE == recycleResult)
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
			log('Creep.prototype.travel No path to the target could be found. ' + this.room.href() + ' ' + this.href() + ' ' + target + ' ' + creepAreaCreepsCount + ' ' + targetAreaCreepsCount + ' ' + distance);
		}
	}
	else if (ERR_INVALID_TARGET == moveResult)
	{
		this.say('🛑');
		log('Creep.prototype.travel ' + this.href() + ' ERR_INVALID_TARGET ' + target);
	}
	else
	{
		this.say('🛑');
		log('Creep.prototype.travel ' + this.href() + ' ' + target + ' ' + moveResult);
	}

	return moveResult;
}

Creep.prototype.bodyScan = function (scan_type)
{
	for (const[part, type]of Object.entries(this.body))
	{
		if (type == scan_type)
		{
			return true;
		}
	}
	return false;
}

Creep.prototype.smartTransfer = function (target, say = "🔋")
{
	const transferResult = this.transfer(target, RESOURCE_ENERGY);

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
		log('ERR_INVALID_TARGET ' + this.href());
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

Creep.prototype.smartUpgradeController = function ()
{
	const upgradeResult = this.upgradeController(this.room.controller);

	if (ERR_NOT_IN_RANGE == upgradeResult)
	{
		this.say("⏫");
		this.travel(this.room.controller);
	}
	else if (OK == upgradeResult)
	{
		this.say("⏫");
	}
	else
	{
		this.say("👺");
		console.log("upgradeResult", upgradeResult, this.href());
	}
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

StructureSpawn.prototype.smartSpawnCreep = function (role, body, givenName)
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

	const spawnResult = this.spawnCreep(body, name,
		{
			memory:
			{
				role: role
			}
		}
		);

	if (ERR_NOT_ENOUGH_ENERGY == spawnResult)
	{
		console.log("smartSpawnCreep", "ERR_NOT_ENOUGH_ENERGY", this.href(), JSON.stringify(bodyMap));
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
		console.log('The spawn is already in process of spawning another creep.', role);
	}
	else if (OK == spawnResult)
	{
		console.log(this.room.href(), 'Spawning:', name, this.href(), this.room.energyAvailable, this.room.energyCapacityAvailable, JSON.stringify(bodyMap));
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
