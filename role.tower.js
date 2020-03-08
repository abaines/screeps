// Kizrak

'use strict';

var roleHarvester = require('role.harvester');

function repairRoomStructureType(tower, structureType, percent)
{
	var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES,
		{
			filter: (structure) =>
			{
				return (structure.hits / structure.hitsMax < percent) && (structureType == structure.structureType);
			}
		}
		);

	if (closestDamagedStructure)
	{
		var repairResult = tower.repair(closestDamagedStructure);
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
		repairRoomStructureType(tower, "road", 0.5);
		repairRoomStructureType(tower, "rampart", 0.001);
		repairRoomStructureType(tower, "constructedWall", 0.0001);
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
	var creep = tower.pos.findClosestByRange(FIND_MY_CREEPS,
		{
			filter: (creep) =>
			{
				return (creep.store.getUsedCapacity() > 0);
			}
		}
		);
	if (creep)
	{
		roleHarvester.smartTransfer(creep, tower);
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
		for (var name in Game.structures)
		{
			var structure = Game.structures[name];

			var structureType = structure.structureType;

			if ("tower" == structureType && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
			{
				getEnergyFromCreeps(structure);
			}
		}
	},
};

module.exports = towerLogic;
