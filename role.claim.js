// Kizrak

'use strict';

var roleHarvester = require('role.harvester');

var claimCreep =
{
	run: function (creep)
	{
		if (creep.room.controller)
		{
			var controller = creep.room.controller;
			if (controller.level == 0 && controller.my == false)
			{
				if (creep.claimController(controller) == ERR_NOT_IN_RANGE)
				{
					creep.moveTo(controller,
					{
						visualizePathStyle:
						{
							stroke: '#ffffff'
						}
					}
					);
				}
			}
		}

		var flags = Game.flags;
		if (Object.keys(flags).length > 0)
		{
			var flag = flags[Object.keys(flags)[0]];
			if (flag.room != creep.room)
			{
				roleHarvester.findAndGotoFlag(creep);
			}
			else
			{
				roleHarvester.run(creep);
			}
		}
	},
};

module.exports = claimCreep;
