// Kizrak

'use strict';

const extensions = require('extensions');
const log = require('log').log;
const empire = require('empire');

const roleHarvester = require('role.harvester');
const roleClaimer = require('role.claim');
const roleTower = require('role.tower');
const roleTombstone = require('role.tombstone');
const roleLink = require('role.link');
const roleSpawning = require('role.spawning');
const roleBuilder = require('role.builder');
const roleExtractor = require('role.extractor');
const roleLab = require('role.lab');
const roleAttack = require('role.attack');

const JSS = JSON.stringify;

log("================================================================================");

Memory.links = {};

function forEachCreeps()
{
	const harvesterTickData = {};

	for (const[name, creep]of Object.entries(Game.creeps))
	{
		if ('harvester' == creep.memory.role)
		{
			roleHarvester.runPerCreep(creep, harvesterTickData);
		}
		else if ('claimer' == creep.memory.role)
		{
			roleClaimer.runPerCreep(creep);
		}
		else if ('builder' == creep.memory.role)
		{
			roleBuilder.runPerCreep(creep);
		}
		else if ('extractor' == creep.memory.role)
		{
			// role.extractor run() takes care of this
		}
		else if ('mineral' == creep.memory.role)
		{
			// role.lab.run() takes care of this
		}
		else if ('melee' == creep.memory.role)
		{
			roleAttack.runPerCreep(creep);
		}
		else
		{
			const msg = "unknown_role " + creep.name + ' ' + creep.memory.role + ' ' + creep.room.href();
			log(msg);
			creep.say("😵");
			creep.recycle();
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
		const roomCreepCount = room.find(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					return 'harvester' == creep.memory.role && creep.body.length > 25;
				}
			}
			).length;
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
		const energyCapacityAvailable = room.energyCapacityAvailable;
		const sourceEnergyList = [];

		for (const[idx, source]of Object.entries(room.find(FIND_SOURCES)))
		{
			sourceEnergyList.push(source.energy);
		}

		room.visual.text("" + energyAvailable + '/' + energyCapacityAvailable + "  " + JSON.stringify(sourceEnergyList), 0, 49,
		{
			align: 'left',
			font: '2',
			opacity: 0.5,
		}
		);
	}
}

var rampCheck = true;

function constructRamparts()
{
	if (Game.time % 1500 == 750 || rampCheck)
	{
		rampCheck = false;
		console.log("Check Ramparts");

		const roomsWithTowers = empire.roomsWithTowers();

		roomsWithTowers.forEach(function (room)
		{
			room.constructRamparts();
		}
		);

		if (false)
		{
			console.log("Checking for deconstruct wall ramparts");
			for (const room of Object.values(Game.rooms))
			{
				room.deconstructWallRamparts();
			}
		}

		empire.printConstructablesAvailable();
	}
}

var decayCheck = true;

function decayReport()
{
	if (Game.time % 1500 == 0 || decayCheck)
	{
		decayCheck = false;

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
	if (Game.cpu.bucket < 250 || Game.cpu.tickLimit < 400)
	{
		console.log(JSS(Game.cpu));
		return;
	}

	const cpuMap = new Map();
	cpuMap.set('total', 0);
	cpuMap.set('start', Game.cpu.getUsed());

	function updateCpuMap(tag)
	{
		if (Game.time % 15 != 0)
		{
			return;
		}
		const used = Game.cpu.getUsed();
		const previous = cpuMap.get('total');
		cpuMap.set(tag, used - previous);
		cpuMap.set('total', used);
	}

	roleLink.determineBehavior();
	updateCpuMap('roleLink.determineBehavior');

	roleTower.run();
	updateCpuMap('roleTower.run');

	roleSpawning.run(Game.spawns);
	updateCpuMap('roleSpawning.run');

	const harvesterTickData = forEachCreeps();
	updateCpuMap('forEachCreeps');

	roleTower.creepTransfer();
	updateCpuMap('roleTower.creepTransfer');

	roleTombstone.run();
	updateCpuMap('roleTombstone.run');

	roleLink.run();
	updateCpuMap('roleLink.run');

	roleBuilder.run();
	updateCpuMap('roleBuilder.run');

	roleExtractor.run();
	updateCpuMap('roleExtractor.run');

	roleLab.run();
	updateCpuMap('roleLab.run');

	roleAttack.run();
	updateCpuMap('roleAttack.run');

	controllerViz();
	updateCpuMap('controllerViz');

	creepViz(harvesterTickData);
	updateCpuMap('creepViz');

	roomViz();
	updateCpuMap('roomViz');

	decayReport();
	updateCpuMap('decayReport');

	constructRamparts();
	updateCpuMap('constructRamparts');

	deadCreepMemoryClean();
	updateCpuMap('deadCreepMemoryClean');

	if (Game.time % 15 == 0)
	{
		function f(value, key, map)
		{
			console.log('\t', key, value);
		}
		const mapSort = new Map([...cpuMap.entries()].sort((a, b) => a[1] - b[1]));
		mapSort.forEach(f);
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

console.log("main.js EOF");
