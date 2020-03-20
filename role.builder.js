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
		const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

		if (creep.store[RESOURCE_ENERGY] == 0 && creep.memory.constructionSite != null)
		{
			const storage = this.findWithdrawStorage(creep);
			if (storage)
			{
				creep.memory.constructionSite = null;
				creep.memory.withDraw = storage.id;
				creep.memory.source = null;
			}
			else
			{
				const source = creep.pickSource();
				if (source && source.energy > 50)
				{
					creep.memory.constructionSite = null;
					creep.memory.withDraw = null;
					creep.memory.source = source.id;
				}
			}
		}

		if (creep.store.getFreeCapacity() == 0)
		{
			creep.memory.constructionSite = site && site.id;
			creep.memory.withDraw = null;
			creep.memory.source = null;
		}

		if (creep.memory.withDraw && Game.getObjectById(creep.memory.withDraw))
		{
			creep.smartWithdraw(Game.getObjectById(creep.memory.withDraw));
		}
		else if (creep.memory.source && Game.getObjectById(creep.memory.source))
		{
			creep.smartHarvest(Game.getObjectById(creep.memory.source));
		}
		else if (creep.memory.constructionSite && Game.getObjectById(creep.memory.constructionSite))
		{
			creep.smartBuild(Game.getObjectById(creep.memory.constructionSite));
		}
		else if (site)
		{
			creep.memory.constructionSite = site && site.id;
			creep.memory.withDraw = null;
			creep.memory.source = null;
		}
		else
		{
			const constructionSites = Game.constructionSites;
			if (constructionSites && constructionSites.length > 0)
			{
				creep.travel(Game.constructionSites[0]);
			}
			else
			{
				log('role.builder ' + creep.href() + ' recycling');
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
