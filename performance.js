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
			const fixed = duration.toFixed(6);
			console.log('[' + fixed.padStart(9) + ']', label);
		}

		return result;
	},
}

module.exports = core;
