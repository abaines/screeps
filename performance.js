// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	measure: function (label, method)
	{
		const starting = Game.cpu.getUsed();

		const result = method();

		const ending = Game.cpu.getUsed();

		console.log(ending - starting, label);

		return result;
	},
}

module.exports = core;
