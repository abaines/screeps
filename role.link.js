// Kizrak

'use strict';

var linkLogic =
{
	determineBehavior: function ()
	{
		for (const[key, value]of Object.entries(Game.structures))
		{
			if (STRUCTURE_LINK == value.structureType)
			{
				console.log('Object.entries', key, value);
			}
		}
	},
};

module.exports = linkLogic;

