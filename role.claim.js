// Kizrak

'use strict';

var claimCreep =
{
	run: function (creep)
	{
		console.log('claimCreep', creep.memory.role, creep.name);
	},
};

module.exports = claimCreep;
