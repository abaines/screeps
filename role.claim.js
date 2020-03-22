// Kizrak

'use strict';

const log = require('log').log;
const empire = require('empire');
const roleHarvester = require('role.harvester');

const JSS = JSON.stringify;

const claimCreep =
{
	gotoFlag: function (creep)
	{
		const flag = empire.findFlag('claim');

		if (flag)
		{
			return creep.gotoFlag(flag);
		}
	},

	runPerCreep: function (creep)
	{
		log("claimer " + creep.href());
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

		roleHarvester.runPerCreep(creep,
		{}
		);
		if (Game.time % 6 == 0)
		{
			creep.say("👩‍🌾");
		}
	},
};

module.exports = claimCreep;
