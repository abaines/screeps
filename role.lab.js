// Kizrak

'use strict';

const log = require('log').log;
const JSS = JSON.stringify;

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

	spawnCreepPerAvailableMineralType: function (mineralContainers)
	{
		const mineralCreeps = {};

		for (const[name, creep]of Object.entries(Game.creeps))
		{
			if ('mineral' == creep.memory.role && creep.memory.mineralType)
			{
				mineralCreeps[creep.memory.mineralType] = creep;
			}
		}

		log("mineralCreeps: "+JSS(mineralCreeps));

		for (const[mineralType, containers]of Object.entries(mineralContainers))
		{
			if (mineralType in mineralCreeps)
			{
				console.log("WE HAVE A CREEP FOR MINERAL: " + mineralType);
			}
			else
			{
				// TODO: spawn creep with role and creep.memory.mineralType
				log(mineralType + containers.length);
			}
		}

	},

	run: function ()
	{
		const fms = this.findMineralContainers();

		//for (const[mineralType, containers]of Object.entries(fms))
		//{
		//	log(mineralType + containers.length);
		//}

		this.spawnCreepPerAvailableMineralType(fms);
	}
}

module.exports = core;
