// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	var goalFlag,

	getGoalFlag = function ()
	{
		if (this.goalFlag)
		{
			return this.goalFlag;
		}
		else
		{
			for (const[name, flag]of Object.entries(Game.flags))
			{
				if (flag.name.includes('invade'))
				{
					this.goalFlag = flag;
					return flag;
				}
			}
		}
	}

	runPerCreep: function (creep)
	{
		const flag = this.getGoalFlag();

		creep.gotoFlag(flag);

		creep.melee();
	},

	getMeleeBody: function (copies)
	{
		// each copy cost 130
		const body = new Array(copies).fill([ATTACK, MOVE]).flat();

		return body;
	},

	run: function ()
	{
		console.log("run()");

		for (const room in Game.rooms)
		{
			const copies = room.idealRoomEnergyRatio(130)
				if (room.controller >= 6 && copies)
				{
					const body = getMeleeBody(copies);

					room.smartSpawnCreep(
					{
						role: 'melee',
					}, body);
				}
		}
	},
}

module.exports = core;
