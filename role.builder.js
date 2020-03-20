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
			console.log("new task", creep.percentStoreFull());
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
					if (source && source.id && source.energy > 50)
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

		log(JSON.stringify(creep.memory.task) + " " + creep.percentStoreFull());

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

				if (energyAvailable >= 3250 && constructionSites.length > 0)
				{
					spawn.smartSpawnCreep('builder',
						[
							WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 15
							CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 20
							MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 15
						],
						'builder');
					return;
				}
			}
		}
	},
}

module.exports = core;
