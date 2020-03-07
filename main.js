// Kizrak

'use strict';

var roleHarvester = require('role.harvester');
var spawnSpawning = require('spawn.spawning');
var towers = require('towers');

function log(msgType, msg)
{
	msg = msg || msgType;
	Memory.logs = Memory.logs || {}
	if (msgType in Memory.logs)
	{
		var time = Memory.logs[msgType];
		if (Game.time - time > 300) // ~1 minute
		{
			console.log(msg);
			Memory.logs[msgType] = Game.time;
		}
	}
	else
	{
		console.log(msg);
		Memory.logs[msgType] = Game.time;
	}
}

module.exports.loop = function ()
{
	var pph = Memory.previousPreviousHarvesters || 0;
	var ph = Memory.previousHarvesters || 0;
	var harvesters = roleHarvester.getHarvesters();
	var harvesterCount = harvesters.length;

	towers.run();
	spawnSpawning.run(Game.spawns);

	for (var name in Game.creeps)
	{
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester')
		{
			var harvestResult = roleHarvester.run(creep);

			if (harvestResult && harvestResult.log)
			{
				log(harvestResult.log);
			}
		}
		else if (creep.memory.role == 'claimer')
		{
			// TODO: Claim
		}
		else
		{
			console.log("unknown role", creep.name, creep.memory.role);
		}
	}

	if (Math.abs(harvesterCount - ph) > 0 || Math.abs(harvesterCount - pph) > 0 || Math.abs(pph - ph) > 0)
	{
		log('harvesterCount', 'Harvesters: ' + ph + ' --> ' + harvesterCount);
	}
	Memory.previousPreviousHarvesters = Memory.previousHarvesters;
	Memory.previousHarvesters = harvesterCount;

	for (var name in Memory.creeps)
	{
		if (!Game.creeps[name])
		{
			delete Memory.creeps[name];
		}
	}
}

function killOld()
{
	var old = null;
	for (var name in Game.creeps)
	{
		var creep = Game.creeps[name];
		var ticksToLive = creep.ticksToLive;
		if (old == null || ticksToLive < old.ticksToLive)
		{
			old = creep;
		}
	}
	console.log('killOld', old.name, old.ticksToLive);
	old.suicide();
}
