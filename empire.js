// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	findFlag: function (nameContains)
	{
		for (const flag of Object.values(Game.flags))
		{
			if (flag.name.includes('invade'))
			{
				return flag;
			}
		}
	},

	run: function ()
	{
		console.log("run()");
	},
}

module.exports = core;
