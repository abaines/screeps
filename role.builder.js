// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	findWithdrawSource: function (creep)
	{
		if (creep.room.storage.store[RESOURCE_ENERGY] > 20 * 50)
		{
			return creep.room.storage;
		}
	},
	runPerCreep: function (creep)
	{
		const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

		if (creep.store[RESOURCE_ENERGY] == 0)
		{
			creep.memory.withDraw = this.findWithdrawSource(creep).id;
			creep.memory.constructionSite = null;
		}
		if (creep.store.getFreeCapacity() == 0)
		{
			creep.memory.constructionSite = site && site.id;
			creep.memory.withDraw = null;
		}

		if (creep.memory.withDraw && Game.getObjectById(creep.memory.withDraw))
		{
			creep.smartWithdraw(Game.getObjectById(creep.memory.withDraw));
		}
		else if (creep.memory.constructionSite && Game.getObjectById(creep.memory.constructionSite))
		{
			creep.smartBuild(Game.getObjectById(creep.memory.constructionSite));
		}
		else if (site)
		{
			creep.memory.constructionSite = site && site.id;
			creep.memory.withDraw = null;
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
