// Kizrak

'use strict';

const log = require('log').log;
const extensions = require('extensions');

const roleHarvester = require('role.harvester');
const roleClaimer = require('role.claim');
const roleTower = require('role.tower');
const roleTombstone = require('role.tombstone');
const roleLink = require('role.link');
const roleSpawning = require('role.spawning');

if ('undefined' !== typeof script_init)
{
	// the variable is defined
}
else
{
	log("================================================================================");
	const script_init = true;
	Memory.links = {};
}

module.exports.loop = function ()
{
	const harvesters = roleHarvester.getHarvesters();
	const harvesterCount = harvesters.length;

	roleLink.determineBehavior();

	roleTower.run();
	roleSpawning.run(Game.spawns);

	const harvesterTickData = {};

	for (const name in Game.creeps)
	{
		const creep = Game.creeps[name];
		if ('harvester' == creep.memory.role)
		{
			const harvestResult = roleHarvester.run(creep, harvesterTickData);

			if (harvestResult && harvestResult.log)
			{
				log(harvestResult.log);
			}
		}
		else if ('claimer' == creep.memory.role)
		{
			roleClaimer.run(creep);
		}
		else
		{
			const msg = "unknown_role " + creep.name + ' ' + creep.memory.role + ' ' + creep.room.href();
			log(msg);
			creep.say("😵");
		}
	}

	roleTower.creepTransfer();
	roleTombstone.run();
	roleLink.run();

	const gclPercent = Game.gcl.level + Game.gcl.progress / Game.gcl.progressTotal;

	const controllerLevelsList = [];
	const creepCountList = [];
	const rooms = Game.rooms;
	for (const idx in rooms)
	{
		const room = rooms[idx];

		const controller = room.controller;
		var level = controller.level + controller.progress / controller.progressTotal;
		level = level || controller.level;

		if (level && level > 0)
			controllerLevelsList.push(level.toFixedNumber(3));

		const roomCreepCount = room.find(FIND_MY_CREEPS).length;
		creepCountList.push(roomCreepCount);
	}

	controllerLevelsList.sort().reverse();

	const vis1 = '' + gclPercent.toFixed(6) + '  ' + JSON.stringify(controllerLevelsList);
	new RoomVisual().text(vis1, 0, 0,
	{
		align: 'left'
	}
	);

	const vis2 = '' + harvesterCount + '  ' + JSON.stringify(creepCountList) + '  ' + (harvesterTickData.bored || 0);
	new RoomVisual().text(vis2, 0, 1,
	{
		align: 'left'
	}
	);

	for (const idx in Game.rooms)
	{
		const room = Game.rooms[idx];
		const energyAvailable = room.energyAvailable;
		const sourceEnergyList = [];
		const sources = room.find(FIND_SOURCES);
		for (const idx in sources)
		{
			sourceEnergyList.push(sources[idx].energy);
		}
		room.visual.text("" + energyAvailable + "  " + JSON.stringify(sourceEnergyList), 0, 49,
		{
			align: 'left'
		}
		);
	}

	for (const name in Memory.creeps)
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
	for (const name in Game.creeps)
	{
		const creep = Game.creeps[name];
		const ticksToLive = creep.ticksToLive;
		if (old == null || ticksToLive < old.ticksToLive)
		{
			old = creep;
		}
	}
	console.log('killOld', old.name, old.ticksToLive);
	old.suicide();
}
