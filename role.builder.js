// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	findWithdrawStorage: function (creep)
	{
		if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 20 * 50)
		{
			return creep.room.storage;
		}
		const container = creep.pos.findClosestByPath(FIND_STRUCTURES,
			{
				filter: (structure) =>
				{
					const structureType = structure.structureType;
					if (STRUCTURE_CONTAINER == structureType)
					{
						const energy = structure.store[RESOURCE_ENERGY];
						return energy > 50;
					}
					else
					{
						return false;
					}
				}
			}
			);
		if (container)
		{
			return container;
		}
	},
	runPerCreep: function (creep)
	{
		if (creep.memory.task && 'harvest' == creep.memory.task.name)
		{
			if (creep.percentStoreFull() >= 1)
			{
				delete creep.memory.task;
			}
			else
			{
				const targetID = creep.memory.task.targetID;
				const target = Game.getObjectById(targetID);
				if (target)
				{
					if (target.energy == 0)
					{
						delete creep.memory.task;
					}
				}
				else
				{
					delete creep.memory.task;
				}
			}
		}

		if (creep.memory.task && 'withdraw' == creep.memory.task.name)
		{
			if (creep.percentStoreFull() >= 1)
			{
				delete creep.memory.task;
			}
			else
			{
				const targetID = creep.memory.task.targetID;
				const target = Game.getObjectById(targetID);
				if (target)
				{
					if (target.store[RESOURCE_ENERGY] == 0)
					{
						delete creep.memory.task;
					}
				}
				else
				{
					delete creep.memory.task;
				}
			}
		}

		if (creep.memory.task && 'construction' == creep.memory.task.name)
		{
			if (creep.store[RESOURCE_ENERGY] == 0)
			{
				delete creep.memory.task;
			}
			else
			{
				const targetID = creep.memory.task.targetID;
				const target = Game.getObjectById(targetID);
				if (target)
				{
					// TODO: Verify
				}
				else
				{
					delete creep.memory.task;
				}
			}
		}

		// pick new task
		if (!creep.memory.task)
		{
			if (creep.percentStoreFull() <= 0)
			{
				const storage = this.findWithdrawStorage(creep);
				if (storage && storage.id)
				{
					creep.memory.task =
					{
						name: 'withdraw',
						targetID: storage.id,
					};
				}
				else
				{
					const source = creep.pickSource();
					if (source && source.id && source.energy > 0)
					{
						creep.memory.task =
						{
							name: 'harvest',
							targetID: source.id,
						};
					}
				}
			}
			else
			{
				const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
				if (site && site.id)
				{
					creep.memory.task =
					{
						name: 'construction',
						targetID: site.id,
					};
				}
			}
		}

		log(creep.href() + (creep.memory.task && creep.memory.task.name), 'builder: ' + creep.href() + '  ' + JSON.stringify(creep.memory.task));

		if (creep.memory.task && 'withdraw' == creep.memory.task.name)
		{
			const targetID = creep.memory.task.targetID;
			const target = Game.getObjectById(targetID);
			creep.smartWithdraw(target);
		}

		if (creep.memory.task && 'harvest' == creep.memory.task.name)
		{
			const targetID = creep.memory.task.targetID;
			const target = Game.getObjectById(targetID);
			creep.smartHarvest(target);
		}

		if (creep.memory.task && 'construction' == creep.memory.task.name)
		{
			const targetID = creep.memory.task.targetID;
			const target = Game.getObjectById(targetID);
			creep.smartBuild(target);
		}

		if (!creep.memory.task && !creep.spawning)
		{
			const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
			if (!site)
			{
				log('creep.recycle()', 'creep.ticksToLive: ' + creep.ticksToLive);
				creep.recycle();
			}
		}
	},
	run: function ()
	{
		if (!Game.creeps['builder'])
		{
			for (const[hash, spawn]of Object.entries(Game.spawns))
			{
				const energyCapacityAvailable = spawn.room.energyCapacityAvailable;
				const energyAvailable = spawn.room.energyAvailable;
				const constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);

				const builderData =
				{
					role: 'builder'
				};

				const builderBaseBody = [WORK, CARRY, MOVE];

				if (constructionSites.length > 0)
				{
					if (energyAvailable >= 1800 && spawn.room.smartSpawnRole(builderData, builderBaseBody, 'builder'))
					{
						console.log("Spawning Builder @ " + spawn.href());
						return;
					}
				}
			}
		}
	},
}

module.exports = core;
