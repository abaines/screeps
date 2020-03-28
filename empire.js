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

	printConstructablesAvailable: function ()
	{
		const map = {};

		for (const room of Object.values(Game.rooms))
		{
			const available = room.getConstructablesAvailable();

			if (room.controller && room.controller.my)
			{
				map[room.name] = available;
			}
		}

		var printHeader = "".padStart(20);

		for (const roomName of Object.keys(map))
		{
			const room = Game.rooms[roomName];
			const t = (room + "-" + room.controller.level).padStart(20);
			printHeader += room.href(t);
		}

		console.log(printHeader);

		for (const[structureType, limits]of Object.entries(CONTROLLER_STRUCTURES))
		{
			if (
				STRUCTURE_NUKER == structureType ||
				STRUCTURE_OBSERVER == structureType ||
				STRUCTURE_POWER_SPAWN == structureType ||
				STRUCTURE_CONTAINER == structureType ||
				STRUCTURE_LAB == structureType ||
				STRUCTURE_TERMINAL == structureType ||
				STRUCTURE_FACTORY == structureType)
			{
				continue;
			}

			var anyMissing = false;

			for (const roomName of Object.keys(map))
			{
				const availableMap = map[roomName];
				const available = availableMap[structureType];
				if (available > 0)
				{
					anyMissing = true;
				}
			}

			if (!anyMissing)
			{
				continue;
			}

			var printRow = structureType.padStart(20);

			for (const roomName of Object.keys(map))
			{
				const availableMap = map[roomName];
				const available = availableMap[structureType];
				const availableText = available > 0 ? "" + available : "";
				printRow += availableText.padStart(20);
			}

			console.log(printRow);
		}
	},

	run: function ()
	{
		console.log("run()");
	},
}

module.exports = empire;
