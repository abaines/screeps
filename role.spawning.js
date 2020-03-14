// Kizrak

'use strict';

const log = require('log').log;
const roleHarvester = require('role.harvester');

const namingMap =
{
	move: "M",
	work: "W",
	carry: "C",
	attack: "A",
	ranged_attack: "R",
	tough: "T",
	heal: "H",
	claim: "L",
}

function spawnCreep(spawn, role, body)
{
	if (spawn.spawning)
	{
		return;
	}

	const bodyMap = {}
	for (const idx in body)
	{
		const part = body[idx];
		if (!(part in bodyMap))
		{
			bodyMap[part] = 0;
		}
		bodyMap[part] = 1 + bodyMap[part];
	}

	var newName = '';

	const namer = Object.keys(bodyMap).map(function (key)
		{
			return [key, bodyMap[key] / body.length];
		}
		).sort(function (a, b)
		{
			return b[1] - a[1];
		}
		);

	namer.forEach(kv =>
	{
		const bodyType = kv[0];
		const percent = kv[1];
		const bodyChar = namingMap[bodyType];

		newName += namingMap[kv[0]];
	}
	);

	newName = newName + ('-' + (Game.time % 10_000)).padStart(5, '0');

	const spawnResult = spawn.spawnCreep(body, newName,
		{
			memory:
			{
				role: role
			}
		}
		);

	if (ERR_NOT_ENOUGH_ENERGY == spawnResult)
	{
		console.log("ERR_NOT_ENOUGH_ENERGY", spawnResult);
	}
	else if (ERR_BUSY == spawnResult && spawn.spawning)
	{
		// ignore
	}
	else if (ERR_NAME_EXISTS == spawnResult)
	{
		// ignore: There is a creep with the same name already.
	}
	else if (ERR_BUSY == spawnResult)
	{
		console.log('The spawn is already in process of spawning another creep.', role);
	}
	else if (OK == spawnResult)
	{
		console.log(spawn.room.href(), 'Spawning:', newName, spawn.href(), spawn.room.energyAvailable, spawn.room.energyCapacityAvailable, JSON.stringify(bodyMap));
	}
	else
	{
		console.log('spawnResult', spawnResult);
	}
}

function spawnLogic(spawn, harvesters)
{
	const roomHarvesterCount = spawn.room.find(FIND_MY_CREEPS).length;
	const energyCapacityAvailable = spawn.room.energyCapacityAvailable;
	const energyAvailable = spawn.room.energyAvailable;

	if ((roomHarvesterCount < 3 || harvesters.length < 5 * 5) && energyAvailable >= 3200 && energyCapacityAvailable < Infinity)
	{
		spawnCreep(spawn, 'harvester',
			[
				WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 14
				CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 15
				MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 22
			]);
	}
	else if (harvesters.length < 3 * 5 && energyAvailable >= 2300 && energyCapacityAvailable < 4300)
	{
		spawnCreep(spawn, 'harvester',
			[WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 14
				CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 8
				MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]// 10
		);
	}
	else if (harvesters.length < 3 * 4 && energyAvailable >= 2000 && energyCapacityAvailable < 2300)
	{
		spawnCreep(spawn, 'harvester',
			[WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 10
				CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 10
				MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]// 10
		);
	}
	else if (harvesters.length < 11 && energyAvailable >= 1200 && energyCapacityAvailable < 2000)
	{
		spawnCreep(spawn, 'harvester',
			[WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]);
	}
	else if (harvesters.length < 10 && energyAvailable >= 800 && energyCapacityAvailable < 1200)
	{
		spawnCreep(spawn, 'harvester',
			[WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]);
	}
	else if (harvesters.length < 9 && energyAvailable >= 550 && energyCapacityAvailable < 800)
	{
		spawnCreep(spawn, 'harvester',
			[WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]);
	}
	else if (harvesters.length < 5 && energyAvailable >= 200 && energyCapacityAvailable < 550)
	{
		spawnCreep(spawn, 'harvester', [WORK, CARRY, MOVE]);
	}
	else if (harvesters.length < 3 && energyAvailable >= 200)
	{
		spawnCreep(spawn, 'harvester', [WORK, CARRY, MOVE]);
	}
	else if (roomHarvesterCount < 4 && energyAvailable >= 300 && energyCapacityAvailable <= 300)
	{
		spawnCreep(spawn, 'harvester',
			[
				WORK, WORK, CARRY, MOVE,
			]);
	}

	// TODO babyBooster

	if (false)
	{
		var claimers = 0;
		for (const name in Game.creeps)
		{
			const creep = Game.creeps[name];
			if (creep.bodyScan("claim"))
			{
				claimers = 1 + claimers
			}
		}
		if (claimers == 0 && energyAvailable >= 900 && energyCapacityAvailable < Infinity)
		{
			spawnCreep(spawn, 'claimer', [CLAIM, WORK, CARRY, MOVE, MOVE, MOVE]);
		}
	}

	if (spawn.spawning)
	{
		const spawningCreep = Game.creeps[spawn.spawning.name];
		spawn.room.visual.text(
			'🛠️' + spawningCreep.memory.role,
			spawn.pos.x + 1,
			spawn.pos.y,
		{
			align: 'left',
			opacity: 0.8
		}
		);
	}
}

const spawnSpawning =
{
	run: function ()
	{
		const harvesters = roleHarvester.getHarvesters();

		for (const hash in Game.spawns)
		{
			const spawn = Game.spawns[hash];
			spawnLogic(spawn, harvesters);
		}
	}
}

module.exports = spawnSpawning;
