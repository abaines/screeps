// Kizrak

'use strict';

var tombstoneLogic =
{
	creepCollectTombstone: function (creep, tombstone)
	{
		var withdrawResult = creep.withdraw(tombstone, RESOURCE_ENERGY);

		if (ERR_NOT_IN_RANGE == withdrawResult)
		{
			creep.moveTo(tombstone,
			{
				visualizePathStyle:
				{
					stroke: '#ffffff'
				}
			}
			);
		}
		else if (OK == withdrawResult)
		{
			console.log("WIN!", 'creepCollectTombstone', JSON.stringify(tombstone.store), tombstone.room.name);
		}
		else
		{
			console.log('withdrawResult', withdrawResult);
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
	perRoom: function (room)
	{
		// FIND_TOMBSTONES
		// FIND_DROPPED_RESOURCES
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
