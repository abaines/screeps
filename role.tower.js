// Kizrak

'use strict';

var log = require('log').log;
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
		repairRoomStructureType(tower, "road", -3 * 800); // 2600
		repairRoomStructureType(tower, "constructedWall", 250_000);
		repairRoomStructureType(tower, "rampart", 250_000);
		repairRoomStructureType(tower, "road", -5 * 800); // 1000
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
				var capacity = creep.store.getCapacity(RESOURCE_ENERGY);
				var creepAvailable = creep.store.getUsedCapacity(RESOURCE_ENERGY);
				var isCreepFull = creep.store.getFreeCapacity(RESOURCE_ENERGY) < 50 && creepAvailable >= 50;
				var towerNeed = tower.store.getFreeCapacity(RESOURCE_ENERGY);
				var isConstruction = creep.memory.construction;

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
		creep.moveAndTransfer(tower);
		creep.say("🗼");
	}
}

function perRoomEnergySteal(room)
{
	var structures = room.find(FIND_MY_STRUCTURES);
	for (var idx in structures)
	{
		var structure = structures[idx];
		var structureType = structure.structureType;

		if ("tower" == structureType && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 500)
		{
			getEnergyFromCreeps(structure);
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
