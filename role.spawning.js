// Kizrak

'use strict';

const log = require('log').log;
const empire = require('empire');

const JSS = JSON.stringify;

const spawnSpawning =
{
	spawnLogic: function (spawn, harvesters)
	{
		const roomHarvesterCount = spawn.room.getCreeps('harvester').length;
		const roomBigHarvesterCount = spawn.room.getCreeps('harvester', 25).length;
		const energyCapacityAvailable = spawn.room.energyCapacityAvailable;
		const energyAvailable = spawn.room.energyAvailable;

		const harvesterData =
		{
			role: 'harvester'
		};

		const harvesterBaseBody = [WORK, CARRY, MOVE];

		if (roomHarvesterCount >= 4 && harvesters.length >= Game.rooms.length * 4)
		{
			// gg
		}
		else if (spawn.room.smartSpawnRole(harvesterData, harvesterBaseBody))
		{
			// yay!
		}
		else if ((roomBigHarvesterCount < 4 || harvesters.length < Game.rooms.length * 4) && energyAvailable >= 3250 && energyCapacityAvailable < Infinity)
		{
			spawn.smartSpawnCreep('harvester',
				[
					WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 15
					CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 15
					MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 20
				]);
		}
		else if (roomBigHarvesterCount < 4 && energyAvailable >= 2300 && energyCapacityAvailable < 3250)
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
		else if (harvesters.length < 5 && energyAvailable >= 200 && energyCapacityAvailable < 550 && roomHarvesterCount < 6)
		{
			spawn.smartSpawnCreep('harvester', [WORK, CARRY, MOVE]);
		}
		else if ((harvesters.length < 3 || roomHarvesterCount < 3) && energyAvailable >= 200 && roomHarvesterCount < 6)
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

		if (empire.findFlag('claim') && spawn.room.controller.level >= 8)
		{
			this.spawnClaimer(spawn, energyAvailable);
		}

		spawn.visualize();
	},

	spawnClaimer: function (spawn, energyAvailable)
	{
		var claimers = 0;

		for (const[name, creep]of Object.entries(Game.creeps))
		{
			if (creep.bodyScan("claim"))
			{
				claimers = 1 + claimers;
			}
		}

		if (claimers == 0 && energyAvailable >= 900)
		{
			spawn.smartSpawnCreep('claimer', [CLAIM, WORK, CARRY, MOVE, MOVE, MOVE]);
			log("spawnClaimer", "spawnClaimer " + spawn.href(), 50);
		}
	},

	run: function ()
	{
		const harvesters = empire.findCreepsByRole('harvester', 25);

		for (const[hash, spawn]of Object.entries(Game.spawns))
		{
			this.spawnLogic(spawn, harvesters);
		}
	}
}

module.exports = spawnSpawning;
