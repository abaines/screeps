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

		if (harvesters.length < Game.rooms.length * 4 && energyAvailable >= 3200 && spawn.room.smartSpawnRole(harvesterData, harvesterBaseBody))
		{
			// yay!
		}
		else if (roomHarvesterCount < 4 && energyAvailable >= 3200 && spawn.room.smartSpawnRole(harvesterData, harvesterBaseBody))
		{
			// yay!
		}
		else if (roomHarvesterCount < 3 && energyAvailable >= 1600 && spawn.room.smartSpawnRole(harvesterData, harvesterBaseBody))
		{
			// yay!
		}
		else if (roomHarvesterCount < 2 && energyAvailable >= 800 && spawn.room.smartSpawnRole(harvesterData, harvesterBaseBody))
		{
			// yay!
		}
		else if (roomHarvesterCount < 1 && energyAvailable >= 0 && spawn.room.smartSpawnRole(harvesterData, harvesterBaseBody, undefined, true))
		{
			// yay!
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
