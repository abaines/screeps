// Kizrak

'use strict';

var tombstoneLogic =
{
	run: function ()
	{
		var sb = []
		for (var idx in Game.rooms)
		{
			var room = Game.rooms[idx];
			sb.push(room.name);
		}
		console.log(JSON.stringify(sb));
	},
};

module.exports = tombstoneLogic;
