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
		// TODO: pick better lab!
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

		const percentFull = creep.percentStoreFull(mineralType);

		const myContainer = Game.getObjectById(creep.memory.container);

		const myLabs = this.getMyLab(mineralType, labMap);
		// TODO: pick better lab!
		const myLab = myLabs[0];

		const labFree = myLab.store.getFreeCapacity(myLab.mineralType);

		if (labFree >= 1250)
		{
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
		}

		if (percentFull > 0 && labFree > 0)
		{
			delete creep.memory.container;

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

		if (percentFull > 0 && labFree <= 0)
		{
			creep.say("🌶️");
			creep.smartTransfer(creep.room.storage, "🌶️", mineralType);
			return;
		}

		creep.recycle();
	},

	handleCreepsAndContainers: function (mineralContainers, mineralCreeps, labMap)
	{
		log("@" + JSS(Object.keys(mineralContainers)));
		log("#" + JSS(Object.keys(mineralCreeps)));
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

	spawnCreepPerAvailableMineralType: function (mineralContainers, labMap)
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
				const myLabs = this.getMyLab(mineralType, labMap);
				// TODO: pick better lab!
				const myLab = myLabs[0];

				const labFree = myLab.store.getFreeCapacity(myLab.mineralType);

				if (labFree > 1250)
				{
					this.spawnCreepForMineral(mineralType, containers);
				}
			}
		}

		this.handleCreepsAndContainers(mineralContainers, mineralCreeps, labMap);
	},

	run: function ()
	{
		const labMap = empire.getLabsByMineral();

		const fms = this.findMineralContainers();

		//for (const[mineralType, containers]of Object.entries(fms))
		//{
		//	log(mineralType + containers.length);
		//}

		this.spawnCreepPerAvailableMineralType(fms, labMap);
	}
}

module.exports = core;
