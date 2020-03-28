// Kizrak

'use strict';

const log = require('log').log;

const JSS = JSON.stringify;

const empire =
{
	findFlag: function (nameContains)
	{
		for (const flag of Object.values(Game.flags))
		{
			if (flag.name.includes(nameContains))
			{
				return flag;
			}
		}
	},

	getLabsByMineral: function ()
	{
		const labs = _.filter(Game.structures, (structure) =>
			{
				return STRUCTURE_LAB == structure.structureType;
			}
			);

		const labMap = {};

		for (const lab of Object.values(labs))
		{
			const mineralType = lab.mineralType;

			if (!(labMap[mineralType]))
			{
				labMap[mineralType] = [];
			}
			labMap[mineralType].push(lab);
		}

		return labMap;
	},

	findCreepsByRole: function (role, size = 0)
	{
		const creeps = _.filter(Game.creeps, (creep) =>
			{
				return role == creep.memory.role && creep.body.length > size;
			}
			);
		return creeps;
	},

	roomsWithTowers: function ()
	{
		const roomsWithTowers = new Set();

		for (const room of Object.values(Game.rooms))
		{
			const towers = room.findStructuresByType(STRUCTURE_TOWER);

			if (towers && towers.length > 0)
			{
				roomsWithTowers.add(room);
			}
		}

		return roomsWithTowers;
	},

	run: function ()
	{
		console.log("run()");
	},
}

module.exports = empire;
