// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	//goalFlag: null,

	getGoalFlag: function ()
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
	},

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
		for (const room of Object.values(Game.rooms))
		{
			const copies = room.idealEnergyRatio(130);

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
