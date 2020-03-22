// Kizrak

'use strict';

const log = require('log').log;
const roleHarvester = require('role.harvester');
const JSS = JSON.stringify;

const claimCreep =
{
	gotoFlag: function (creep)
	{
		for (const[name, flag]of Object.entries(Game.flags))
		{
			// TODO: find a claim-type flag
			creep.gotoFlag(flag);
		}
		return false;
	},
	runPerCreep: function (creep)
	{
		if (this.gotoFlag(creep))
		{
			return;
		}

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

				return;
			}
		}

		roleHarvester.runPerCreep(creep);
		if (Game.time % 6 == 0)
		{
			creep.say("👩‍🌾");
		}
	},
};

module.exports = claimCreep;
