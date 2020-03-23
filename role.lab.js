// Kizrak

'use strict';

const log = require('log').log;
const empire = require('empire');
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

	getMyLab: function (mineralType, labMap)
	{
		const myLabs = labMap[mineralType];
		if (myLabs)
		{
			return myLabs;
		}
		else
		{
			return labMap[undefined];
		}
	},

	perCreep: function (creep, containers, labMap)
	{
		const mineralType = creep.memory.mineralType;

		log(creep);
		log(JSS(creep.memory));
		log(containers);

		const percentFull = creep.percentStoreFull(mineralType);

		const myContainer = Game.getObjectById(creep.memory.container);

		if (percentFull == 0)
		{
			// TODO: pick better container!!
			const container = containers[0];
			creep.memory.container = container;
			creep.smartWithdraw(container, mineralType);
			return;
		}
		else if (myContainer && percentFull < 1)
		{
			creep.smartWithdraw(myContainer, mineralType);
			return;
		}

		if (percentFull > 0)
		{
			delete creep.memory.container;

			const myLabs = this.getMyLab(mineralType, labMap);

			const myLab = myLabs[0];

			if (myLab)
			{
				creep.smartTransfer(myLab, "🧂", mineralType);
				return;
			}
			else
			{
				log("NO LAB! " + creep.href());
			}
		}
	},

	handleCreepsAndContainers: function (mineralContainers, mineralCreeps)
	{
		log("@" + JSS(Object.keys(mineralContainers)));
		log("#" + JSS(Object.keys(mineralCreeps)));
		const labMap = empire.getLabsByMineral();
		log("$" + JSS(Object.keys(labMap)));

		for (const[mineralType, creep]of Object.entries(mineralCreeps))
		{
			const containers = mineralContainers[mineralType];

			this.perCreep(creep, containers, labMap);
		}
	},

	spawnCreepForMineral: function (mineralType, containers)
	{
		log('extractable-mineral-types: ' + mineralType + containers.length);

		if (containers.length != 1)
		{
			// TODO: only count containers near extractors? or select the one with most materials?
			log("TODO mineral containers.length != 1");
		}

		for (const container of containers)
		{
			const room = container.room;

			const data =
			{
				role: 'mineral',
				mineralType: mineralType,
			};

			const body = [CARRY, MOVE];

			const name = 'mineral ' + mineralType;

			if (room.smartSpawnRole(data, body, name))
			{
				return;
			}
		}
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

		log("mineralCreeps: " + JSS(Object.keys(mineralCreeps)));

		for (const[mineralType, containers]of Object.entries(mineralContainers))
		{
			if (mineralType in mineralCreeps)
			{
				// We have creeps for this mineral. Do not need to spawn another.
			}
			else
			{
				this.spawnCreepForMineral(mineralType, containers);
			}
		}

		this.handleCreepsAndContainers(mineralContainers, mineralCreeps);
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
