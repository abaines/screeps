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

function forEachCreeps()
{
	const harvesterTickData = {};

	for (const[name, creep]of Object.entries(Game.creeps))
	{
		if ('harvester' == creep.memory.role)
		{
			const harvestResult = roleHarvester.runPerCreep(creep, harvesterTickData);

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

	return harvesterTickData;
}

function controllerViz()
{
	const gclPercent = Game.gcl.level + Game.gcl.progress / Game.gcl.progressTotal;

	const controllerLevelsList = [];
	const rooms = Game.rooms;

	for (const[idx, room]of Object.entries(Game.rooms))
	{
		const controller = room.controller;

		if (controller)
		{
			const level = room.controller.getLevel();

			if (level && level > 0)
			{
				controllerLevelsList.push(level.toFixedNumber(3));
			}
		}
	}

	controllerLevelsList.sort().reverse();

	const vis1 = '' + controllerLevelsList.length + '/' + gclPercent.toFixed(6) + '  ' + JSON.stringify(controllerLevelsList);
	new RoomVisual().text(vis1, 0, 1,
	{
		align: 'left',
		font: '2',
		opacity: 0.5,
	}
	);
}

function creepViz(harvesterTickData)
{
	const harvesters = roleHarvester.getHarvesters();
	const harvesterCount = harvesters.length;

	const creepCountList = [];

	for (const[idx, room]of Object.entries(Game.rooms))
	{
		const roomCreepCount = room.find(FIND_MY_CREEPS).length;
		creepCountList.push(roomCreepCount);
	}

	const vis2 = '' + harvesterCount + '  ' + JSON.stringify(creepCountList) + '  ' + (harvesterTickData.bored || 0);
	new RoomVisual().text(vis2, 0, 3,
	{
		align: 'left',
		font: '2',
		opacity: 0.5,
	}
	);
}

function roomViz()
{
	for (const[idx, room]of Object.entries(Game.rooms))
	{
		const energyAvailable = room.energyAvailable;
		const sourceEnergyList = [];

		for (const[idx, source]of Object.entries(room.find(FIND_SOURCES)))
		{
			sourceEnergyList.push(source.energy);
		}

		room.visual.text("" + energyAvailable + "  " + JSON.stringify(sourceEnergyList), 0, 49,
		{
			align: 'left',
			font: '2',
			opacity: 0.5,
		}
		);
	}
}

function decayReport()
{
	if (Game.time % 1500 == 0)
	{
		var decay =
		{
			ticksToDowngrade: Infinity
		};

		for (const[idx, room]of Object.entries(Game.rooms))
		{
			const controller = room.controller;
			if (controller && controller.my)
			{
				const ticksToDowngrade = controller.ticksToDowngrade;
				if (ticksToDowngrade && ticksToDowngrade < decay.ticksToDowngrade)
				{
					decay = controller;
				}
			}
		}

		console.log("decay", decay.href(decay.room + ' ' + decay.ticksToDowngrade));
	}
}

function deadCreepMemoryClean()
{
	for (const name in Memory.creeps)
	{
		if (!Game.creeps[name])
		{
			delete Memory.creeps[name];
		}
	}
}

module.exports.loop = function ()
{
	roleLink.determineBehavior();

	roleTower.run();
	roleSpawning.run(Game.spawns);

	const harvesterTickData = forEachCreeps();

	roleTower.creepTransfer();
	roleTombstone.run();
	roleLink.run();

	controllerViz();

	creepViz(harvesterTickData);

	roomViz();

	decayReport();

	deadCreepMemoryClean();
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
