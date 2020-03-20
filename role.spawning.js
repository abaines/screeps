// Kizrak

'use strict';

const log = require('log').log;
const roleHarvester = require('role.harvester');

const spawnSpawning =
{
	spawnLogic: function (spawn, harvesters)
	{
		const roomHarvesterCount = spawn.room.find(FIND_MY_CREEPS).length;
		const energyCapacityAvailable = spawn.room.energyCapacityAvailable;
		const energyAvailable = spawn.room.energyAvailable;

		if ((roomHarvesterCount < 4 || harvesters.length < Game.rooms.length * 4) && energyAvailable >= 3200 && energyCapacityAvailable < Infinity)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 15
					CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 15
					MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 20
				]);
		}
		else if (harvesters.length < 3 * 5 && energyAvailable >= 2300 && energyCapacityAvailable < 4300)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 14
					CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 8
					MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 10
				]);
		}
		else if (harvesters.length < 3 * 4 && energyAvailable >= 2000 && energyCapacityAvailable < 2300)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 10
					CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 10
					MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 10
				]);
		}
		else if (harvesters.length < 11 && energyAvailable >= 1200 && energyCapacityAvailable < 2000)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
					CARRY, CARRY, CARRY, CARRY,
					MOVE, MOVE, MOVE, MOVE,
				]);
		}
		else if (harvesters.length < 10 && energyAvailable >= 800 && energyCapacityAvailable < 1200)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, WORK, WORK, WORK, WORK,
					CARRY, CARRY,
					MOVE, MOVE,
				]);
		}
		else if (harvesters.length < 9 && energyAvailable >= 550 && energyCapacityAvailable < 800)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, WORK, WORK,
					CARRY,
					MOVE, MOVE,
				]);
		}
		else if (harvesters.length < 5 && energyAvailable >= 200 && energyCapacityAvailable < 550)
		{
			spawn.smartSpawnCreep('harvester', [WORK, CARRY, MOVE]);
		}
		else if (harvesters.length < 3 && energyAvailable >= 200)
		{
			spawn.smartSpawnCreep('harvester', [WORK, CARRY, MOVE]);
		}
		else if (roomHarvesterCount < 4 && energyAvailable >= 300 && energyCapacityAvailable <= 300)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, CARRY, MOVE,
				]);
		}

		// TODO babyBooster

		if (false)
		{
			this.spawnClaimer();
		}

		spawn.visualize();
	},

	spawnClaimer: function ()
	{
		var claimers = 0;

		for (const[name, creep]of Object.entries(Game.creeps))
		{
			if (creep.bodyScan("claim"))
			{
				claimers = 1 + claimers
			}
		}

		if (claimers == 0 && energyAvailable >= 900 && energyCapacityAvailable < Infinity)
		{
			spawn.smartSpawnCreep('claimer', [CLAIM, WORK, CARRY, MOVE, MOVE, MOVE]);
		}
	},

	run: function ()
	{
		const harvesters = roleHarvester.getHarvesters();

		for (const[hash, spawn]of Object.entries(Game.spawns))
		{
			this.spawnLogic(spawn, harvesters);
		}
	}
}

module.exports = spawnSpawning;
