// Kizrak

'use strict';

const log = require('log').log;

const roleHarvester =
{
	getHarvesters: function ()
	{
		const harvesters = _.filter(Game.creeps, (creep) => 'harvester' == creep.memory.role && creep.body.length > 25);
		return harvesters;
	},

	buildConstruction: function (creep, constructionSites, structureType)
	{
		for (const[idx, structure]of Object.entries(constructionSites))
		{
			if (structureType == structure.structureType)
			{
				creep.smartBuild(structure);
				return true;
			}
		}
	},

	runPerCreep: function (creep, harvesterTickData)
	{
		if (creep.spawning)
		{
			return;
		}

		const creepCount = creep.room.find(FIND_MY_CREEPS).length;

		// planning phase
		if ((creep.store.getUsedCapacity() == 0 && creep.memory.mode == null) || (creep.memory.mode != null && Game.getObjectById(creep.memory.mode).energy == 0))
		{
			const source = creep.pickSource();

			creep.memory.mode = source && source.id;
		}
		if (creep.store.getFreeCapacity() == 0)
		{
			creep.memory.mode = null
		}

		// action phase
		if (creep.memory.mode != null)
		{
			const source = Game.getObjectById(creep.memory.mode);
			if (source && source.energy > 0)
			{
				creep.smartHarvest(source);
				return;
			}
		}

		if (creep.store.getUsedCapacity() > 0)
		{
			const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

			if (this.buildConstruction(creep, constructionSites, STRUCTURE_SPAWN))
			{
				return;
			}

			if (constructionSites.length)
			{
				const constructionCreeps = creep.room.find(FIND_MY_CREEPS,
					{
						filter: (creepFind) =>
						{
							return creepFind.memory.construction;
						}
					}
					);
				const constructionCreepsCount = constructionCreeps.length;

				if (constructionCreepsCount > 1 && constructionCreepsCount >= (creepCount / 2.0))
				{
					console.log('constructionCreepsCount', constructionCreepsCount);
					creep.memory.construction = false;
					return;
				}

				if (creep.memory.construction || constructionCreepsCount == 0)
				{
					const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
					creep.smartBuild(target, "👷");
					creep.memory.construction = true;
					return;
				}
			}

			const target = creep.findStructureThatNeedEnergy();
			if (target != null)
			{
				return creep.smartTransfer(target);
			}

			if (this.buildConstruction(creep, constructionSites, STRUCTURE_RAMPART))
			{
				return;
			}
			else if (this.buildConstruction(creep, constructionSites, STRUCTURE_WALL))
			{
				return;
			}
			else if (this.buildConstruction(creep, constructionSites, STRUCTURE_EXTENSION))
			{
				return;
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
				const linkGoal = nearbyLink.getGoalType();
				if ("sink" == linkGoal && nearbyLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400)
				{
					creep.smartTransfer(nearbyLink);
				}
				else if ("fountain" == linkGoal && nearbyLink.store[RESOURCE_ENERGY] >= 50)
				{
					creep.smartWithdraw(nearbyLink);
				}
			}

			if (creep.room.controller && creep.room.controller.ticksToDowngrade > CONTROLLER_DOWNGRADE[6])
			{
				const storage = creep.room.storage;
				if (storage && storage.store[RESOURCE_ENERGY] < 500_000)
				{
					creep.smartTransfer(storage, "🏦");
					return;
				}
				else if (this.buildConstruction(creep, constructionSites, STRUCTURE_STORAGE))
				{
					return;
				}
			}

			if (creep.room.controller && creep.room.controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[6])
			{
				creep.smartUpgradeController();
				return;
			}
		}

		const controlRoomCreepCount = {};
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
			const structure = Game.structures[id];
			const structureType = structure.structureType;
			const room = structure.room;
			const length = room.find(FIND_MY_CREEPS,
				{
					filter: (creep) =>
					{
						return creep.body.length > 25 && 'harvester' == creep.memory.role;
					}
				}
				).length;

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

		const roomCreeps = creep.room.find(FIND_MY_CREEPS);
		var youngest = true;
		for (const idx in roomCreeps)
		{
			const otherCreep = roomCreeps[idx];
			if (otherCreep.ticksToLive > creep.ticksToLive)
			{
				youngest = false;
			}
		}

		if (youngest && roomCreeps.length >= mostRoom.length && roomCreeps.length > leastRoom.length + 1)
		{
			const controller = leastRoom.controller;
			const moveResult = creep.travel(controller);
			if (OK == moveResult || ERR_TIRED == moveResult)
			{
				creep.say(roomCreeps.length + " > " + leastRoom.length);
				log(creep.href() + " > " + controller.room.href());
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

		const sources = creep.room.find(FIND_SOURCES);
		var nextSource =
		{
			ticksToRegeneration: Infinity
		};
		for (const idx in sources)
		{
			const source = sources[idx];
			if (source.ticksToRegeneration < nextSource.ticksToRegeneration)
			{
				nextSource = source;
			}
		}
		const moveResult = creep.travel(nextSource);

		harvesterTickData.bored = (harvesterTickData.bored || 0) + 1;
	},

};

module.exports = roleHarvester;
