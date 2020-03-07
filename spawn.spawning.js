// Kizrak

'use strict';

var roleHarvester = require('role.harvester');

function spawnCreep(spawn, role, body)
{
	var newName = role + Game.time;

	var spawnReturn = Game.spawns['Spawn1'].spawnCreep(body, newName,
		{
			memory:
			{
				role: role
			}
		}
		);

	if (ERR_NOT_ENOUGH_ENERGY == spawnReturn)
	{
		console.log("ERR_NOT_ENOUGH_ENERGY", spawnReturn);
	}
	else if (ERR_BUSY == spawnReturn)
	{
		console.log('The spawn is already in process of spawning another creep.', role);
	}
	else if (OK == spawnReturn)
	{
		console.log('Spawning:', newName, body, spawn.room.energyAvailable, spawn.room.energyCapacityAvailable);
	}
	else
	{
		console.log('spawnReturn', spawnReturn);
	}
}

function bodyScan(creep, scan_type)
{
	for (var part in creep.body)
	{
		var type = creep.body[part].type;
		if (type == scan_type)
		{
			return true;
		}
	}
	return false;
}

var spawnSpawning =
{
	run: function ()
	{
		var harvesters = roleHarvester.getHarvesters();
		var energyCapacityAvailable = Game.spawns['Spawn1'].room.energyCapacityAvailable;
		var energyAvailable = Game.spawns['Spawn1'].room.energyAvailable;

		if (harvesters.length < 15 && energyAvailable >= 2300 && energyCapacityAvailable < Infinity)
		{
			spawnCreep(Game.spawns['Spawn1'], 'harvester',
				[WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 14
					CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 8
					MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]// 10
			);
		}
		else if (harvesters.length < 11 && energyAvailable >= 1200 && energyCapacityAvailable < 2300)
		{
			spawnCreep(Game.spawns['Spawn1'], 'harvester',
				[WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]);
		}
		else if (harvesters.length < 10 && energyAvailable >= 800 && energyCapacityAvailable < 1200)
		{
			spawnCreep(Game.spawns['Spawn1'], 'harvester',
				[WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]);
		}
		else if (harvesters.length < 9 && energyAvailable >= 550 && energyCapacityAvailable < 800)
		{
			spawnCreep(Game.spawns['Spawn1'], 'harvester',
				[WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]);
		}
		else if (harvesters.length < 5 && energyAvailable >= 200 && energyCapacityAvailable < 550)
		{
			spawnCreep(Game.spawns['Spawn1'], 'harvester', [WORK, CARRY, MOVE]);
		}
		else if (harvesters.length < 3 && energyAvailable >= 200)
		{
			spawnCreep(Game.spawns['Spawn1'], 'harvester', [WORK, CARRY, MOVE]);
		}

		if (false)
		{
			var claimers = 0;
			for (var name in Game.creeps)
			{
				var creep = Game.creeps[name];
				if (bodyScan(creep, "claim"))
				{
					claimers = 1 + claimers
				}
			}
			if (claimers == 0 && energyAvailable >= 900 && energyCapacityAvailable < Infinity)
			{
				spawnCreep(Game.spawns['Spawn1'], 'claimer', [CLAIM, WORK, CARRY, MOVE, MOVE, MOVE]);
			}
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
