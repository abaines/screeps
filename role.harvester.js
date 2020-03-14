// Kizrak

'use strict';

var log = require('log').log;

function _getHarvesters()
{
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	return harvesters;
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
			creep.smartHarvest(source);
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
					creep.smartBuild(structure);
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
					creep.smartBuild(target, "👷");
					creep.memory.construction = true;
					return;
				}
			}

			var target = findStructuresThatNeedEnergy(creep, STRUCTURE_EXTENSION);
			if (target != null)
			{
				return creep.smartTransfer(target);
			}

			var target = findStructuresThatNeedEnergy(creep, STRUCTURE_SPAWN);
			if (target != null)
			{
				return creep.smartTransfer(target);
			}

			for (var idx in targets)
			{
				var structure = targets[idx];
				if (structure.structureType == STRUCTURE_RAMPART)
				{
					creep.smartBuild(structure);
					return;
				}
			}

			for (var idx in targets)
			{
				var structure = targets[idx];
				if (structure.structureType == STRUCTURE_WALL)
				{
					creep.smartBuild(structure);
					return;
				}
			}

			for (var idx in targets)
			{
				var structure = targets[idx];
				if (structure.structureType == STRUCTURE_EXTENSION)
				{
					creep.smartBuild(structure);
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
			if (nearbyLink && creep.pos.distance(nearbyLink) < 5)
			{
				var linkGoal = Memory.links[creep.room.name][nearbyLink.id].goal;
				if (linkGoal == "sink" && nearbyLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400)
				{
					creep.smartTransfer(nearbyLink);
				}
				else if (linkGoal == "fountain" && nearbyLink.store[RESOURCE_ENERGY] >= 50)
				{
					creep.smartWithdraw(nearbyLink);
				}
			}

			if (creep.room.controller.ticksToDowngrade > CONTROLLER_DOWNGRADE[6])
			{
				var storage = creep.room.storage;
				if (storage && storage.store[RESOURCE_ENERGY] < 500_000)
				{
					creep.travel(storage);
					creep.smartTransfer(storage, "🏦");
					return;
				}
				else
				{
					for (var idx in targets)
					{
						var structure = targets[idx];
						if (structure.structureType == STRUCTURE_STORAGE)
						{
							creep.smartBuild(structure, "🚧🏦");
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
