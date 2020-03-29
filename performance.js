// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	measure: function (label, method, enabled = 0)
	{
		const starting = Game.cpu.getUsed();

		const result = method();

		const ending = Game.cpu.getUsed();

		const duration = ending - starting;

		if ((enabled || enabled == 0) && duration > enabled)
		{
			const t = '' + duration;
			console.log(t.padEnd(22), label);
		}

		return result;
	},
}

module.exports = core;
