// Kizrak

var roleHarvester = require('role.harvester');
var spawnSpawning = require('spawn.spawning');
var towers = require('towers');

module.exports.loop = function ()
{
	var pph = Memory.previousPreviousHarvesters || 0;
	var ph = Memory.previousHarvesters || 0;
	var harvesters = roleHarvester.getHarvesters();
	var harvesterCount = harvesters.length;

	towers.run();
	spawnSpawning.run(Game.spawns);

	var hasLogged = {};

	for (var name in Game.creeps)
	{
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester')
		{
			var harvestResult = roleHarvester.run(creep);

			if (harvestResult && harvestResult.log)
			{
				var log = harvestResult.log;

				if (!(log in hasLogged))
				{
					console.log(harvestResult.log);
					hasLogged[log] = true;
				}
			}
		}
		else
		{
			console.log(creep.name);
		}
	}

	//console.log(Object.keys(Game.creeps).length);

	if (Math.abs(harvesterCount - ph) > 1 || Math.abs(harvesterCount - pph) > 1 || Math.abs(pph - ph) > 1)
	{
		console.log('Harvesters: ' + ph + ' --> ' + harvesterCount);
	}
	Memory.previousPreviousHarvesters = Memory.previousHarvesters;
	Memory.previousHarvesters = harvesterCount;

	for (var name in Memory.creeps)
	{
		if (!Game.creeps[name])
		{
			delete Memory.creeps[name];
			//console.log('Clearing non-existing creep memory:', name);
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
	console.log(old.name, old.ticksToLive);
	old.suicide();
}
