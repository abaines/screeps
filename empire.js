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

	run: function ()
	{
		console.log("run()");
	},
}

module.exports = empire;
