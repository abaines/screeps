// Kizrak

'use strict';

const log = require('log').log;

const rawMineralTypes = new Set(
		[
			RESOURCE_HYDROGEN,
			RESOURCE_OXYGEN,
			RESOURCE_UTRIUM,
			RESOURCE_LEMERGIUM,
			RESOURCE_KEANIUM,
			RESOURCE_ZYNTHIUM,
			RESOURCE_CATALYST,
			RESOURCE_GHODIUM,
		]);

const core =
{
	findMineralContainers: function ()
	{
		const mineralContainers = {};

		for (const[name, room]of Object.entries(Game.rooms))
		{
			const containers = room.find(FIND_STRUCTURES,
				{
					filter: (structure) =>
					{
						const structureType = structure.structureType;
						if (STRUCTURE_CONTAINER == structureType)
						{
							return structure.store.getUsedCapacity() > 0;

						}
					}
				}
				);

			for (const container of containers)
			{
				const store = container.store;
				const keys = Object.keys(store);

				for (const mineralType of Object.values(keys))
				{
					if (rawMineralTypes.has(mineralType))
					{
						if (!(mineralType in mineralContainers))
						{
							mineralContainers[mineralType] = [];
						}
						mineralContainers[mineralType].push(container);
					}
				}
			}
		}

		return mineralContainers;
	},

	run: function ()
	{
		const fms = this.findMineralContainers();
		for (const[mineralType, containers]of Object.entries(fms))
		{
			log(mineralType + containers.length);
		}
	}
}

module.exports = core;
