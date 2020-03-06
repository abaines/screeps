// Kizrak

'use strict';

function run_tower(tower)
{
	var hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
	tower.attack(hostiles[0]);
}

var towerLogic =
{
	run: function ()
	{
		for (var name in Game.structures)
		{
			var tower = Game.structures[name];
			var structureType = Game.structures[name].structureType;
			if ("tower" == structureType)
			{
				run_tower(tower);
			}
		}
	},
};

module.exports = towerLogic;
