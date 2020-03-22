// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	//goalFlag: null,

	getGoalFlag: function ()
	{
		if (this.goalFlag && Game.getObjectById(this.goalFlag.id))
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

		creep.recycle();

		creep.melee();
	},

	getMeleeBody: function (copies)
	{
		copies = Math.min(copies, 25);

		// each copy cost 130
		const body = new Array(copies).fill([ATTACK, MOVE]).flat();

		return body;
	},

	run: function ()
	{
		const meleeCreeps = _.filter(Game.creeps, (creep) => 'melee' == creep.memory.role);

		log("number of meleeCreeps " + meleeCreeps.length);

		if (meleeCreeps.length > 8)
		{
			return;
		}

		for (const room of Object.values(Game.rooms))
		{
			const copies = room.idealEnergyRatio(130);

			if (room.controller.level >= 6 && copies)
			{
				const body = this.getMeleeBody(copies);

				room.smartSpawnCreep(
				{
					role: 'melee',
				}, body);
			}
		}
	},
}

module.exports = core;
