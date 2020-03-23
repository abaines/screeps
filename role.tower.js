// Kizrak

'use strict';

const log = require('log').log;

function run_tower(tower)
{
	const hostiles = tower.room.find(FIND_HOSTILE_CREEPS);

	if (hostiles.length > 0)
	{
		tower.attack(hostiles[0]);
		return;
	}

	if (tower.store.getUsedCapacity(RESOURCE_ENERGY) / tower.store.getCapacity(RESOURCE_ENERGY) > 0.25)
	{
		tower.repairNonDefense();
		tower.repairDefenses();
		tower.repairRoads();
		tower.repairWeakNonRoads();
		tower.repairDefenses(15_000);
	}
}

function getEnergyFromCreeps(tower)
{
	const creep = tower.pos.findClosestByPath(FIND_MY_CREEPS,
		{
			filter: (creep) =>
			{
				const capacity = creep.store.getCapacity(RESOURCE_ENERGY);
				const creepAvailable = creep.store.getUsedCapacity(RESOURCE_ENERGY);
				const isCreepFull = creep.store.getFreeCapacity(RESOURCE_ENERGY) < 50 && creepAvailable >= 50;
				const towerNeed = tower.store.getFreeCapacity(RESOURCE_ENERGY);
				const isConstruction = creep.memory.construction;

				if (isConstruction || capacity < 50 || creepAvailable < 50)
				{
					return false;
				}
				if (isCreepFull || creepAvailable >= 500)
				{
					return true;
				}
				return creep.memory.mode == null;
			}
		}
		);
	if (creep)
	{
		creep.smartTransfer(tower, "🗼");
	}
}

function perRoomEnergySteal(room)
{
	const structures = room.find(FIND_MY_STRUCTURES);
	for (const idx in structures)
	{
		const structure = structures[idx];
		const structureType = structure.structureType;

		if ("tower" == structureType && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 500)
		{
			getEnergyFromCreeps(structure);
		}
	}
}

const towerLogic =
{
	run: function ()
	{
		for (const name in Game.structures)
		{
			const structure = Game.structures[name];

			const structureType = structure.structureType;

			if ("tower" == structureType)
			{
				run_tower(structure);
			}
		}
	},
	creepTransfer: function ()
	{
		for (const room in Game.rooms)
		{
			perRoomEnergySteal(Game.rooms[room]);
		}
	},
};

module.exports = towerLogic;
