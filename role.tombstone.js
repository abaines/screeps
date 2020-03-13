// Kizrak

'use strict';

var tombstoneLogic =
{
	creepCollectTombstone: function (creep, tombstone)
	{
		var withdrawResult = creep.withdraw(tombstone, RESOURCE_ENERGY);

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
		var pickupResult = creep.pickup(resource);

		if (ERR_NOT_IN_RANGE == pickupResult)
		{
			creep.travel(resource);
		}
		else if (OK == pickupResult)
		{
			console.log("WIN!", 'creepCollectResource', JSON.stringify(resource), resource.room.href());
		}
		else
		{
			console.log('pickupResult', pickupResult);
		}
		return;
	},
	findCreepToGetStore: function (store, pos)
	{
		var creep = pos.findClosestByPath(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					var freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
					var isCreepEmpty = creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
					var isConstruction = creep.memory.construction;

					return !isConstruction && (isCreepEmpty || freeCapacity >= store.getUsedCapacity(RESOURCE_ENERGY));
				}
			}
			);

		return creep;
	},
	findCreepToGetResource: function (resource)
	{
		var creep = resource.pos.findClosestByPath(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					var freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
					var isCreepEmpty = creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
					var isConstruction = creep.memory.construction;

					return !isConstruction && (isCreepEmpty || freeCapacity >= resource.amount);
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
		var tombstones = room.find(FIND_TOMBSTONES,
			{
				filter: (tombstone) =>
				{
					return tombstone.store[RESOURCE_ENERGY] >= 50;
				}
			}
			);

		if (tombstones.length)
		{
			for (var idx in tombstones)
			{
				var tombstone = tombstones[idx];
				var creep = this.findCreepToGetStore(tombstone.store, tombstone.pos);

				if (creep)
				{
					this.creepCollectTombstone(creep, tombstone);
					creep.say("♻️");
					return;
				}
			}
		}

		// FIND_DROPPED_RESOURCES
		var resources = room.find(FIND_DROPPED_RESOURCES,
			{
				filter: (resource) =>
				{
					return resource.amount >= 50 && "RESOURCE_ENERGY" == resource.resourceType;
				}
			}
			);

		if (resources.length)
		{
			for (var idx in resources)
			{
				var resource = resources[idx];
				var creep = this.findCreepToGetResource(resource);

				if (creep)
				{
					this.creepCollectResource(creep, resource);
					creep.say("♻️");
					return;
				}
			}
		}
	},
	run: function ()
	{
		for (var idx in Game.rooms)
		{
			var room = Game.rooms[idx];
			this.perRoom(room);
		}
	},
};

module.exports = tombstoneLogic;
