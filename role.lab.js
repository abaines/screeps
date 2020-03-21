// Kizrak

'use strict';

const log = require('log').log;

const rawMinerals =
{
	RESOURCE_HYDROGEN,
	RESOURCE_OXYGEN,
	RESOURCE_UTRIUM,
	RESOURCE_LEMERGIUM,
	RESOURCE_KEANIUM,
	RESOURCE_ZYNTHIUM,
	RESOURCE_CATALYST,
	RESOURCE_GHODIUM,
};

console.log(JSON.stringify(rawMinerals));

const core =
{
	findMineralStorage: function ()
	{
		for (const[name, room]of Object.entries(Game.rooms))
		{
			const containers = room.find(FIND_STRUCTURES,
				{
					filter: (structure) =>
					{
						const structureType = structure.structureType;
						if (STRUCTURE_CONTAINER == structureType)
						{
							const store = structure.store;
							const keys = Object.keys(store);

							for (const v of Object.values(keys))
							{
								log("### "  + v + "  " + store[v]);
							}

							return true;
						}
					}
				}
				);

			if (containers.length)
			{
				log("!" + containers);
			}
		}
	},

	run: function ()
	{
		this.findMineralStorage();
	}
}

module.exports = core;
