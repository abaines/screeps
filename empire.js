// Kizrak

'use strict';

const log = require('log').log;

const empire =
{
	findFlag: function (nameContains)
	{
		for (const flag of Object.values(Game.flags))
		{
			if (flag.name.includes(nameContains))
			{
				return flag;
			}
		}
	},

	findCreepsByRole: function (role, size = 0)
	{
		const creeps = _.filter(Game.creeps, (creep) =>
			{
				return role == creep.memory.role && creep.body.length > size;
			}
			);
		return creeps;
	},

	run: function ()
	{
		console.log("run()");
	},
}

module.exports = empire;
