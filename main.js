// Kizrak

'use strict';

var roleHarvester = require('role.harvester');
var roleClaimer = require('role.claim');
var roleTower = require('role.tower');
var roleTombstone = require('role.tombstone');
var spawnSpawning = require('spawn.spawning');

if (typeof script_init !== 'undefined')
{
	// the variable is defined
}
else
{
	console.log("================================================================================");
	var script_init = true;
}

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
	var harvesters = roleHarvester.getHarvesters();
	var harvesterCount = harvesters.length;

	roleTower.run();
	spawnSpawning.run(Game.spawns);

	var harvesterTickData = {};

	for (var name in Game.creeps)
	{
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester')
		{
			var harvestResult = roleHarvester.run(creep, harvesterTickData);

			if (harvestResult && harvestResult.log)
			{
				log(harvestResult.log);
			}
		}
		else if (creep.memory.role == 'claimer')
		{
			roleClaimer.run(creep);
		}
		else
		{
			console.log("unknown_role", creep.name, creep.memory.role, creep.room.name);
			creep.say("😵");
		}
	}

	roleTower.creepTransfer();
	roleTombstone.run();

	var gclPercent = Game.gcl.progress / Game.gcl.progressTotal;
	var vis = '' + harvesterCount + '  ' + gclPercent + '  ' + (harvesterTickData.bored || 0);
	new RoomVisual().text(vis, 0, 0,
	{
		align: 'left'
	}
	);

	for (var idx in Game.rooms)
	{
		var room = Game.rooms[idx];
		var energyAvailable = room.energyAvailable;
		room.visual.text(energyAvailable, 0, 49,
		{
			align: 'left'
		}
		);
	}

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
