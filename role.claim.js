// Kizrak

'use strict';

const log = require('log').log;
const roleHarvester = require('role.harvester');

const claimCreep =
{
	gotoFlag: function (creep)
	{
		for (const[name, flag]of Object.entries(Game.flags))
		{
			if (flag.room.controller && !flag.room.controller.my && flag.room.controller.level == 0)
			{
				creep.say("🚩");
				creep.travel(flag);
				return true;
			}
		}
		return false;
	},
	run: function (creep)
	{
		if (creep.room.controller)
		{
			const controller = creep.room.controller;
			if (controller.level == 0 && !controller.my)
			{
				creep.say("🏁");
				const claimResult = creep.claimController(controller);

				if (ERR_NOT_IN_RANGE == claimResult)
				{
					creep.travel(controller);
				}
				else
				{
					log("claimResult: " + claimResult + ' ' + creep.room.href());
				}
			}
		}

		if (!gotoFlag(creep))
		{
			creep.say("Harvester");
			roleHarvester.run(creep);
		}
	},
};

module.exports = claimCreep;
