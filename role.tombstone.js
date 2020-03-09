// Kizrak

'use strict';

var tombstoneLogic =
{
	findCreepToGetStore: function (store, pos)
	{
		console.log(pos, JSON.stringify(store));
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
				this.findCreepToGetStore(tombstone.store, tombstone.pos);
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
