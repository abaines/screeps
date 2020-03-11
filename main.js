// Kizrak

'use strict';

var extensions = require('extensions');
var roleHarvester = require('role.harvester');
var roleClaimer = require('role.claim');
var roleTower = require('role.tower');
var roleTombstone = require('role.tombstone');
var roleLink = require('role.link');
var roleSpawning = require('role.spawning');

if (typeof script_init !== 'undefined')
{
	// the variable is defined
}
else
{
	console.log("================================================================================");
	var script_init = true;
	Memory.links = {};
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

	roleLink.determineBehavior();

	roleTower.run();
	roleSpawning.run(Game.spawns);

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
	roleLink.run();

	var gclPercent = Game.gcl.level + Game.gcl.progress / Game.gcl.progressTotal;

	var controllerLevelsList = [];
	var creepCountList = [];
	var rooms = Game.rooms;
	for (var idx in rooms)
	{
		var room = rooms[idx];

		var controller = room.controller;
		var level = controller.level + controller.progress / controller.progressTotal;
		controllerLevelsList.push(level.toFixedNumber(3));

		var roomCreepCount = room.find(FIND_MY_CREEPS).length;
		creepCountList.push(roomCreepCount);
	}

	var vis1 = '' + gclPercent.toFixed(6) + '  ' + JSON.stringify(controllerLevelsList);
	new RoomVisual().text(vis1, 0, 0,
	{
		align: 'left'
	}
	);

	var vis2 = '' + harvesterCount + '  ' + JSON.stringify(creepCountList) + '  ' + (harvesterTickData.bored || 0);
	new RoomVisual().text(vis2, 0, 1,
	{
		align: 'left'
	}
	);

	for (var idx in Game.rooms)
	{
		var room = Game.rooms[idx];
		var energyAvailable = room.energyAvailable;
		var sourceEnergyList = [];
		var sources = room.find(FIND_SOURCES);
		for (var idx in sources)
		{
			sourceEnergyList.push(sources[idx].energy);
		}
		room.visual.text("" + energyAvailable + "  " + JSON.stringify(sourceEnergyList), 0, 49,
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
