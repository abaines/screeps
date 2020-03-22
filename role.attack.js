// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	getGoalFlag: function ()
	{
		// GLOBAL: this.goalFlag
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

		if (flag)
		{
			creep.gotoFlag(flag);
		}

		if (creep.melee())
		{}
		else
		{
			creep.recycle();
		}
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

		if (meleeCreeps.length)
		{
			log("number of meleeCreeps: " + meleeCreeps.length);
		}

		const flag = this.getGoalFlag();
		if (!flag)
		{
			return;
		}

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
