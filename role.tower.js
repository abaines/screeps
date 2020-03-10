// Kizrak

'use strict';

var roleHarvester = require('role.harvester');

function repairRoomStructureType(tower, structureType, hits)
{
	var damagedStructures = tower.room.find(FIND_STRUCTURES,
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

		for (var idx in damagedStructures)
		{
			var damaged = damagedStructures[idx];

			if (damaged.hits < weakest.hits)
			{
				weakest = damaged;
			}
		}

		var repairResult = tower.repair(weakest);
	}
}

function run_tower(tower, injuredStructure)
{
	var hostiles = tower.room.find(FIND_HOSTILE_CREEPS);

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
		repairRoomStructureType(tower, "road", -3 * 800);
		repairRoomStructureType(tower, "constructedWall", 200_000);
		repairRoomStructureType(tower, "rampart", 200_000);
	}
}

function getInjuredStructure()
{
	for (var name in Game.structures)
	{
		var structure = Game.structures[name];

		var structureType = structure.structureType;
		var hits = structure.hits;
		var hitsMax = structure.hitsMax;

		if (hits < hitsMax && structureType != "rampart")
		{
			console.log('getInjuredStructure', structure, structureType);
			return structure;
		}
	}
}

function getEnergyFromCreeps(tower)
{
	var creep = tower.pos.findClosestByPath(FIND_MY_CREEPS,
		{
			filter: (creep) =>
			{
				var isCreepFull = (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0);
				var creepAvailable = creep.store.getUsedCapacity(RESOURCE_ENERGY);
				var towerNeed = tower.store.getFreeCapacity(RESOURCE_ENERGY);

				return isCreepFull && creepAvailable < towerNeed;
			}
		}
		);
	if (creep)
	{
		roleHarvester.smartTransfer(creep, tower);
		return true;
	}
}

function perRoomEnergySteal(room)
{
	var structures = room.find(FIND_MY_STRUCTURES);
	for (var idx in structures)
	{
		var structure = structures[idx];
		var structureType = structure.structureType;

		if ("tower" == structureType && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
		{
			if (getEnergyFromCreeps(structure))
			{
				return true;
			}
		}
	}
}

var towerLogic =
{
	run: function ()
	{
		var injuredStructure = getInjuredStructure();

		for (var name in Game.structures)
		{
			var structure = Game.structures[name];

			var structureType = structure.structureType;

			if ("tower" == structureType)
			{
				run_tower(structure, injuredStructure);
			}
		}
	},
	creepTransfer: function ()
	{
		for (var room in Game.rooms)
		{
			perRoomEnergySteal(Game.rooms[room]);
		}
	},
};

module.exports = towerLogic;
