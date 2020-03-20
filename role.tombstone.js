// Kizrak

'use strict';

const log = require('log').log;

const tombstoneLogic =
{
	isTombstoneCreep: function (creep, usedCapacity)
	{
		const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
		const isCreepEmpty = creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
		const isConstruction = creep.memory.construction;

		const isHarvester = 'harvester' == creep.memory.role;

		return isHarvester && !isConstruction && (isCreepEmpty || freeCapacity >= usedCapacity);
	},

	creepCollectTombstone: function (creep, tombstone)
	{
		const withdrawResult = creep.withdraw(tombstone, RESOURCE_ENERGY);

		if (ERR_NOT_IN_RANGE == withdrawResult)
		{
			creep.travel(tombstone);
		}
		else if (OK == withdrawResult)
		{
			console.log("WIN!", 'creepCollectTombstone', JSON.stringify(tombstone.store), tombstone.room.href());
		}
		else
		{
			console.log('withdrawResult', withdrawResult);
		}
		return;
	},
	creepCollectResource: function (creep, resource)
	{
		const pickupResult = creep.pickup(resource);

		if (ERR_NOT_IN_RANGE == pickupResult)
		{
			creep.travel(resource);
		}
		else if (OK == pickupResult)
		{
			console.log("WIN!", 'creepCollectResource', resource.href());
		}
		else
		{
			console.log('pickupResult', pickupResult);
		}
		return;
	},
	findCreepToGetStore: function (store, pos)
	{
		const creep = pos.findClosestByPath(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					return this.isTombstoneCreep(creep, store.getUsedCapacity(RESOURCE_ENERGY));
				}
			}
			);

		return creep;
	},
	findCreepToGetResource: function (resource)
	{
		const creep = resource.pos.findClosestByPath(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					return this.isTombstoneCreep(creep, resource.amount);
				}
			}
			);

		return creep;
	},
	perRoom: function (room)
	{
		if (room.find(FIND_HOSTILE_CREEPS).length)
		{
			return;
		}

		// FIND_TOMBSTONES
		const tombstones = room.find(FIND_TOMBSTONES,
			{
				filter: (tombstone) =>
				{
					return tombstone.store[RESOURCE_ENERGY] >= 50;
				}
			}
			);

		if (tombstones.length)
		{
			for (const idx in tombstones)
			{
				const tombstone = tombstones[idx];
				const creep = this.findCreepToGetStore(tombstone.store, tombstone.pos);

				if (creep)
				{
					this.creepCollectTombstone(creep, tombstone);
					creep.say("♻️");
					return;
				}
			}
		}

		// FIND_DROPPED_RESOURCES
		const resources = room.find(FIND_DROPPED_RESOURCES,
			{
				filter: (resource) =>
				{
					return resource.amount >= 50 && RESOURCE_ENERGY == resource.resourceType;
				}
			}
			);

		if (resources.length)
		{
			for (const idx in resources)
			{
				const resource = resources[idx];
				const creep = this.findCreepToGetResource(resource);

				if (creep)
				{
					this.creepCollectResource(creep, resource);
					creep.say("♻️");
					return;
				}
			}
		}

		// TODO: Ruin
	},
	run: function ()
	{
		for (const idx in Game.rooms)
		{
			const room = Game.rooms[idx];
			this.perRoom(room);
		}
	},
};

module.exports = tombstoneLogic;
