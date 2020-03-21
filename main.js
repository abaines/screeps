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
const roleBuilder = require('role.builder');
const roleExtractor = require('role.extractor');
const roleLab = require('role.lab');

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
		const roomCreepCount = room.find(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					return 'harvester' == creep.memory.role && creep.body.length > 1;
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

function checkStructureForRampart(structure)
{
	const found = structure.pos.lookFor(LOOK_STRUCTURES);

	const stypes = {};

	for (const[idx, structure]of Object.entries(found))
	{
		const structureType = structure.structureType;
		if (STRUCTURE_RAMPART == structureType)
		{
			return;
		}
		stypes[structureType] = true;
	}

	console.log(JSON.stringify(stypes));

	structure.constructRampart();
}

function constructRamparts()
{
	if (Game.time % 1500 == 750)
	{
		console.log("Check Ramparts");
		const myStructureTypes = {}

		for (const[hash, structure]of Object.entries(Game.structures))
		{
			const structureType = structure.structureType;
			myStructureTypes[structureType] = true;

			if (STRUCTURE_RAMPART == structureType)
			{}
			else if (STRUCTURE_EXTENSION == structureType)
			{}
			else if (STRUCTURE_EXTRACTOR == structureType)
			{}
			else if (STRUCTURE_CONTROLLER == structureType)
			{}
			else
			{
				checkStructureForRampart(structure);
			}
		}

		const myRoomStructureTypes = {}

		for (const[hash, room]of Object.entries(Game.rooms))
		{
			const structures = room.find(FIND_STRUCTURES);

			for (const[idx, structure]of Object.entries(structures))
			{
				const structureType = structure.structureType;
				myRoomStructureTypes[structureType] = true;

				if (STRUCTURE_CONTAINER == structureType)
				{
					checkStructureForRampart(structure);
				}
			}
		}

		const missing = {}

		for (const[structureType, value]of Object.entries(myRoomStructureTypes))
		{
			if (myStructureTypes[structureType])
			{}
			else
			{
				missing[structureType] = true;
			}
		}

		if (false)
		{
			console.log(JSON.stringify(myStructureTypes));
			console.log(JSON.stringify(myRoomStructureTypes));
			console.log(JSON.stringify(missing));
		}
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
	roleBuilder.run();
	roleExtractor.run();
	roleLab.run();

	controllerViz();

	creepViz(harvesterTickData);

	roomViz();

	decayReport();

	constructRamparts();

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

console.log("main.js EOF");
