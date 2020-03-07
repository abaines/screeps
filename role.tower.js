// Kizrak

'use strict';

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

	if (tower.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
	{
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES,
			{
				filter: (structure) => structure.hitsMax - structure.hits > 1000
			}
			);

		if (closestDamagedStructure)
		{
			var repairResult = tower.repair(closestDamagedStructure);
			console.log('closestDamagedStructure', closestDamagedStructure);
		}
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

		if (hits < hitsMax)
		{
			console.log('getInjuredStructure', structure);
			return structure;
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
};

module.exports = towerLogic;
