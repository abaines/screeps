// Kizrak

'use strict';

function _getHarvesters()
{
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	return harvesters;
}

function _smartTransfer(creep, target)
{
	var transferResult = creep.transfer(target, RESOURCE_ENERGY);
	if (ERR_NOT_IN_RANGE == transferResult)
	{
		creep.travel(target);
	}
	else if (OK == transferResult)
	{}
	else if (ERR_INVALID_TARGET == transferResult)
	{
		console.log('transferResult', 'The target is not a valid object which can contain the specified resource.', target);
	}
	else if (ERR_NOT_ENOUGH_RESOURCES == transferResult)
	{
		creep.say("🥛");
		console.log('transferResult', 'The creep does not have the given amount of resources.', target, creep.room.href);
	}
	else
	{
		console.log('transferResult', transferResult);
	}
}

function findStructuresThatNeedEnergy(creep, structureType)
{
	var room = creep.room;

	var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES,
		{
			filter: (structure) =>
			{
				return (structure.structureType == structureType) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		}
		);

	return target;
}

function _smartHarvest(creep, source)
{
	var harvestResult = creep.harvest(source);

	if (harvestResult == ERR_NOT_IN_RANGE)
	{
		creep.travel(source);
	}
	else if (harvestResult == OK)
	{}
	else if (harvestResult == ERR_BUSY)
	{
		var ret =
		{
			log: "The creep is still being spawned."
		};
		return ret;
	}
	else if (harvestResult == ERR_NOT_ENOUGH_RESOURCES)
	{
		var ret =
		{
			log: "The target does not contain any harvestable energy or mineral."
		};
		return ret;
	}
	else if (harvestResult == ERR_NO_BODYPART)
	{
		var ret =
		{
			log: "There are no WORK body parts in this creep’s body."
		};
		return ret;
	}
	else
	{
		var ret =
		{
			"log": ("creep.harvest = " + harvestResult)
		};
		return ret;
	}
}

function smartBuild(creep, structure)
{
	var buildResult = creep.build(structure);

	if (buildResult == ERR_NOT_IN_RANGE)
	{
		creep.travel(structure);
	}
	else if (buildResult == ERR_NOT_ENOUGH_RESOURCES)
	{
		console.log('The creep does not have any carried energy.');
		return false;
	}
	return true;
}

function gotoFlag(creep, flag)
{
	var range = creep.pos.getRangeTo(flag);
	if (range > 1)
	{
		var moveReturn = creep.travel(flag);
		creep.say(creep.pos.x + '  ' + creep.pos.y + '  ' + range);
	}
}

function _findAndGotoFlag(creep)
{
	var flags = Game.flags;
	if (Object.keys(flags).length > 0)
	{
		var flag = flags[Object.keys(flags)[0]];
		gotoFlag(creep, flag);
	}
}

function sourceMostEnergy(room)
{
	var sources = room.find(FIND_SOURCES_ACTIVE);

	var most =
	{
		energy: -1
	};

	for (var idx in sources)
	{
		var source = sources[idx];
		if (source.energy > most.energy)
		{
			most = source;
		}
	}

	if (most.energy > 0)
	{
		return most;
	}
	else
	{
		return null;
	}
}

function pickSource(creep)
{
	var sourceBestOptions = []

	sourceBestOptions.push(creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE));
	sourceBestOptions.push(sourceMostEnergy(creep.room));

	var source = sourceBestOptions[Math.floor(Math.random() * sourceBestOptions.length)];

	return source;
}

var roleHarvester =
{
	getHarvesters: _getHarvesters,
	findAndGotoFlag: _findAndGotoFlag,
	smartHarvest: _smartHarvest,
	smartTransfer: _smartTransfer,

	/** @param {Creep} creep **/
	run: function (creep, harvesterTickData)
	{
		if (creep.spawning)
		{
			return;
		}

		var creepCount = creep.room.find(FIND_MY_CREEPS).length;

		// planning phase
		if ((creep.store.getUsedCapacity() == 0 && creep.memory.mode == null) || (creep.memory.mode != null && Game.getObjectById(creep.memory.mode).energy == 0))
		{
			var source = pickSource(creep);

			if (source != null)
			{
				creep.memory.mode = source.id;
			}
			else
			{
				creep.memory.mode = null;
			}
		}
		if (creep.store.getFreeCapacity() == 0)
		{
			creep.memory.mode = null
		}

		// action phase
		if (creep.memory.mode != null)
		{
			var source = Game.getObjectById(creep.memory.mode);
			this.smartHarvest(creep, source);
			return;
		}

		if (creep.store.getUsedCapacity() > 0)
		{
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);

			for (var idx in targets)
			{
				var structure = targets[idx];
				if (structure.structureType == STRUCTURE_SPAWN)
				{
					smartBuild(creep, structure);
					creep.say("🚧");
					return;
				}
			}

			if (targets.length)
			{
				var constructionCreeps = creep.room.find(FIND_MY_CREEPS,
					{
						filter: (creepFind) =>
						{
							return creepFind.memory.construction;
						}
					}
					);
				var constructionCreepsCount = constructionCreeps.length;

				if (constructionCreepsCount > 1 && constructionCreepsCount >= (creepCount / 2.0))
				{
					console.log('constructionCreepsCount', constructionCreepsCount);
					creep.memory.construction = false;
					return;
				}

				if (creep.memory.construction || constructionCreepsCount == 0)
				{
					var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
					smartBuild(creep, target);
					creep.memory.construction = true;
					creep.say("👷");
					return;
				}
			}

			var target = findStructuresThatNeedEnergy(creep, STRUCTURE_EXTENSION);
			if (target != null)
			{
				return _smartTransfer(creep, target);
			}

			var target = findStructuresThatNeedEnergy(creep, STRUCTURE_SPAWN);
			if (target != null)
			{
				return _smartTransfer(creep, target);
			}

			for (var idx in targets)
			{
				var structure = targets[idx];
				if (structure.structureType == STRUCTURE_RAMPART)
				{
					smartBuild(creep, structure);
					creep.say("🚧");
					return;
				}
			}

			for (var idx in targets)
			{
				var structure = targets[idx];
				if (structure.structureType == STRUCTURE_WALL)
				{
					smartBuild(creep, structure);
					creep.say("🚧");
					return;
				}
			}

			for (var idx in targets)
			{
				var structure = targets[idx];
				if (structure.structureType == STRUCTURE_EXTENSION)
				{
					smartBuild(creep, structure);
					creep.say("🚧");
					return;
				}
			}

			const nearbyLink = creep.pos.findClosestByRange(FIND_MY_STRUCTURES,
				{
					filter:
					{
						structureType: STRUCTURE_LINK
					}
				}
				);
			if (nearbyLink && creep.pos.distanceToStructure(nearbyLink) < 5)
			{
				var linkGoal = Memory.links[creep.room.name][nearbyLink.id].goal;
				if (linkGoal == "sink" && nearbyLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400)
				{
					creep.say("🔋");
					_smartTransfer(creep, nearbyLink);
				}
				else if (linkGoal == "fountain" && nearbyLink.store[RESOURCE_ENERGY] >= 50)
				{
					creep.moveAndWithdraw(nearbyLink);
				}
			}

			if (creep.room.controller.ticksToDowngrade > CONTROLLER_DOWNGRADE[5])
			{
				var storage = creep.room.storage;
				if (storage && storage.store[RESOURCE_ENERGY] < 500_000)
				{
					creep.say("🏦");
					creep.travel(storage);
					_smartTransfer(creep, storage);
					return;
				}
				else
				{
					for (var idx in targets)
					{
						var structure = targets[idx];
						if (structure.structureType == STRUCTURE_STORAGE)
						{
							creep.say("🚧🏦");
							smartBuild(creep, structure);
							return;
						}
					}
				}
			}

			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
			{
				creep.travel(creep.room.controller);
			}
			return;
		}

		var controlRoomCreepCount = {};
		var leastRoom =
		{
			length: Infinity
		};
		var mostRoom =
		{
			length: -1
		};

		Object.keys(Game.structures).forEach(function (id)
		{
			var structure = Game.structures[id];
			var structureType = structure.structureType;
			var room = structure.room;
			var length = room.find(FIND_MY_CREEPS).length;

			if ("controller" == structureType)
			{
				controlRoomCreepCount[structure.room] =
				{
					length: length,
					controller: structure
				};

				if (length < leastRoom.length)
				{
					leastRoom = controlRoomCreepCount[structure.room];
				}
				if (length > mostRoom.length)
				{
					mostRoom = controlRoomCreepCount[structure.room];
				}
			}
		}
		);

		var roomCreeps = creep.room.find(FIND_MY_CREEPS);
		var youngest = true;
		for (var idx in roomCreeps)
		{
			var otherCreep = roomCreeps[idx];
			if (otherCreep.ticksToLive > creep.ticksToLive)
			{
				youngest = false;
			}
		}

		if (youngest && roomCreeps.length >= mostRoom.length && roomCreeps.length > leastRoom.length + 1)
		{
			var controller = leastRoom.controller;
			var moveResult = creep.travel(controller);
			if (OK == moveResult || ERR_TIRED == moveResult)
			{
				creep.say(roomCreeps.length + " > " + leastRoom.length);
			}
			else if (ERR_NO_PATH == moveResult)
			{
				creep.say('🛑');
				console.log('No path to the target could be found.', creep.name, creep.pos.toString().padEnd(21), controller.pos.toString().padEnd(21));
			}
			else
			{
				console.log("creep-room-transfer", 'moveResult', moveResult);
			}
			return;
		}

		var sources = creep.room.find(FIND_SOURCES);
		var nextSource =
		{
			ticksToRegeneration: Infinity
		};
		for (var idx in sources)
		{
			var source = sources[idx];
			if (source.ticksToRegeneration < nextSource.ticksToRegeneration)
			{
				nextSource = source;
			}
		}
		var moveResult = creep.travel(nextSource);

		harvesterTickData.bored = (harvesterTickData.bored || 0) + 1;
	},

};

module.exports = roleHarvester;
