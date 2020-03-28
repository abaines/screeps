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
			const containers = room.findStructuresByType(STRUCTURE_CONTAINER);

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
			// TODO: pick better lab!
			return myLabs[0];
		}
		else
		{
			// TODO: pick better lab!
			return labMap[undefined][0];
		}
	},

	perCreep: function (creep, containers, labMap)
	{
		const mineralType = creep.memory.mineralType;

		const percentFull = creep.percentStoreFull(mineralType);

		const myContainer = Game.getObjectById(creep.memory.container);

		const myLab = this.getMyLab(mineralType, labMap);

		if (myLab.isFree())
		{
			if (percentFull == 0 && containers)
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

		if (percentFull > 0 && myLab.isFree())
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

		if (percentFull > 0 && myLab.isFull())
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
				const myLab = this.getMyLab(mineralType, labMap);

				if (myLab.isFree())
				{
					this.spawnCreepForMineral(mineralType, containers);
				}
			}
		}

		this.handleCreepsAndContainers(mineralContainers, mineralCreeps, labMap);
	},

	chemicalReactions: function (labMap)
	{
		const lab_O = this.getMyLab(RESOURCE_OXYGEN, labMap);
		const lab_H = this.getMyLab(RESOURCE_HYDROGEN, labMap);
		const lab_HO = this.getMyLab(RESOURCE_HYDROXIDE, labMap);

		const lab_Z = this.getMyLab(RESOURCE_ZYNTHIUM, labMap);
		const lab_ZO = this.getMyLab(RESOURCE_ZYNTHIUM_OXIDE, labMap);
		const lab_ZHO2 = this.getMyLab(RESOURCE_ZYNTHIUM_ALKALIDE, labMap);

		log('' + lab_O.href() + lab_Z.href() + lab_ZO.href());

		lab_ZO.smartRunReaction(lab_O, lab_Z);

		lab_HO.smartRunReaction(lab_O, lab_H);

		lab_ZHO2.smartRunReaction(lab_HO, lab_ZO);
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

		this.chemicalReactions(labMap);
	}
}

module.exports = core;
