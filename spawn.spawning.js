// Kizrak

var roleHarvester = require('role.harvester');

function spawnHarvester(spawn, body)
{
	var newName = 'Harvester' + Game.time;

	var spawnReturn = Game.spawns['Spawn1'].spawnCreep(body, newName,
		{
			memory:
			{
				role: 'harvester'
			}
		}
		);

	if (ERR_NOT_ENOUGH_ENERGY == spawnReturn)
	{
		console.log("ERR_NOT_ENOUGH_ENERGY", spawnReturn);
	}
	else if (ERR_BUSY == spawnReturn)
	{
		console.log("ERR_BUSY", spawnReturn);
	}
	else if (OK == spawnReturn)
	{
		console.log('Spawning:', newName, body);
	}
	else
	{
		console.log('spawnReturn', spawnReturn);
	}
}

var spawnSpawning =
{
	run: function ()
	{
		var harvesters = roleHarvester.getHarvesters();
		var energyCapacityAvailable = Game.spawns['Spawn1'].room.energyCapacityAvailable;
		var energyAvailable = Game.spawns['Spawn1'].room.energyAvailable;

		if (harvesters.length < 10 && energyAvailable >= 1200)
		{
			spawnHarvester(Game.spawns['Spawn1'], [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]);
		}
		else if (harvesters.length < 10 && energyAvailable >= 800 && energyCapacityAvailable < 1200)
		{
			spawnHarvester(Game.spawns['Spawn1'], [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]);
		}
		else if (harvesters.length < 9 && energyAvailable >= 550 && energyCapacityAvailable < 800)
		{
			spawnHarvester(Game.spawns['Spawn1'], [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]);
		}
		else if (harvesters.length < 5 && energyAvailable >= 200 && energyCapacityAvailable < 550)
		{
			spawnHarvester(Game.spawns['Spawn1'], [WORK, CARRY, MOVE]);
		}
		else if (harvesters.length < 3 && energyAvailable >= 200)
		{
			spawnHarvester(Game.spawns['Spawn1'], [WORK, CARRY, MOVE]);
		}

		if (Game.spawns['Spawn1'].spawning)
		{
			var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
			Game.spawns['Spawn1'].room.visual.text(
				'🛠️' + spawningCreep.memory.role,
				Game.spawns['Spawn1'].pos.x + 1,
				Game.spawns['Spawn1'].pos.y,
			{
				align: 'left',
				opacity: 0.8
			}
			);
		}
	}
}

module.exports = spawnSpawning;
