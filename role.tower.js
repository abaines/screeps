// Kizrak

'use strict';

const log = require('log').log;
const roleHarvester = require('role.harvester');

function repairRoomStructureType(tower, structureType, hits)
{
	const damagedStructures = tower.room.find(FIND_STRUCTURES,
		{
			filter: (structure) =>
			{
				if (structureType != structure.structureType)
				{
					return false;
				}
				else if (hits < 0)
				{
					return structure.hits < structure.hitsMax + hits;
				}
				else
				{
					return (structure.hits < hits);
				}
			}
		}
		);

	if (damagedStructures.length > 0)
	{

		var weakest =
		{
			hits: Infinity
		};

		for (const idx in damagedStructures)
		{
			const damaged = damagedStructures[idx];

			if (damaged.hits < weakest.hits)
			{
				weakest = damaged;
			}
		}

		const repairResult = tower.repair(weakest);
	}
}

function run_tower(tower, injuredStructure)
{
	const hostiles = tower.room.find(FIND_HOSTILE_CREEPS);

	if (hostiles.length > 0)
	{
		tower.attack(hostiles[0]);
		return;
	}

	if (injuredStructure)
	{
		tower.repair(injuredStructure);
		console.log('tower.repair', injuredStructure);
		return;
	}

	if (tower.store.getUsedCapacity(RESOURCE_ENERGY) / tower.store.getCapacity(RESOURCE_ENERGY) > 0.25)
	{
		repairRoomStructureType(tower, "road", -3 * 800); // 2600

		repairRoomStructureType(tower, "constructedWall", 250_000);
		repairRoomStructureType(tower, "rampart", 250_000);

		repairRoomStructureType(tower, "road", -5 * 800); // 1000

		repairRoomStructureType(tower, "constructedWall", 1_000);
		repairRoomStructureType(tower, "rampart", 1_000);
	}
}

function getInjuredStructure()
{
	for (const name in Game.structures)
	{
		const structure = Game.structures[name];

		const structureType = structure.structureType;
		const hits = structure.hits;
		const hitsMax = structure.hitsMax;

		if (hits < hitsMax && structureType != "rampart")
		{
			console.log('getInjuredStructure', structure, structureType);
			return structure;
		}
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
		const injuredStructure = getInjuredStructure();

		for (const name in Game.structures)
		{
			const structure = Game.structures[name];

			const structureType = structure.structureType;

			if ("tower" == structureType)
			{
				run_tower(structure, injuredStructure);
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
