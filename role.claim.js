// Kizrak

'use strict';

var roleHarvester = require('role.harvester');

var claimCreep =
{
	run: function (creep)
	{
		if (creep.room.controller)
		{
			creep.say("c.r.c");
			var controller = creep.room.controller;
			if (controller.level == 0 && !controller.my)
			{
				creep.say("!my");
				var claimResult = creep.claimController(controller);
				creep.say('c' + claimResult);
				if (claimResult == ERR_NOT_IN_RANGE)
				{
					var moveResult = creep.moveTo(controller,
						{
							visualizePathStyle:
							{
								stroke: '#ffffff'
							}
						}
						);
					creep.say('m' + moveResult);
				}
			}
		}

		var flags = Game.flags;
		if (Object.keys(flags).length > 0)
		{
			var flag = flags[Object.keys(flags)[0]];
			if (flag.room != creep.room)
			{
				creep.say("flag");
				roleHarvester.findAndGotoFlag(creep);
			}
			else
			{
				creep.say("roleHarvester");
				roleHarvester.run(creep);
			}
		}
	},
};

module.exports = claimCreep;
