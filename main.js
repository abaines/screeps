// Kizrak

var roleHarvester = require('role.harvester');
var spawnSpawning = require('spawn.spawning');

module.exports.loop = function ()
{
	var ph = Memory.previousHarvesters || 0;
	var harvesters = roleHarvester.getHarvesters();

	spawnSpawning.run(Game.spawns);

	for (var name in Game.creeps)
	{
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester')
		{
			roleHarvester.run(creep);
		}
		else
		{
			console.log(creep.name);
		}
	}

	//console.log(Object.keys(Game.creeps).length);

	if (harvesters.length != ph)
	{
		console.log('Harvesters: ' + ph + ' --> ' + harvesters.length);
	}
	Memory.previousHarvesters = harvesters.length;

	for (var name in Memory.creeps)
	{
		if (!Game.creeps[name])
		{
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
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
