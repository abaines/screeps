// Kizrak

'use strict';

const log = require('log').log;
const JSS = JSON.stringify;

const core =
{
	getExtractorAndContainer: function (room)
	{
		const extractors = room.findMyStructuresByType(STRUCTURE_EXTRACTOR);

		if (extractors && extractors.length == 1)
		{
			const extractor = extractors[0];

			const containers = extractor.pos.findInRange(FIND_STRUCTURES, 1,
				{
					filter:
					{
						structureType: STRUCTURE_CONTAINER
					}
				}
				);
			if (containers && containers.length == 1)
			{
				const container = containers[0];
				const r =
				{
					extractor: extractor,
					container: container,
				};
				return r;
			}
			else if (containers && containers.length == 0)
			{}
			else
			{
				console.log('bad-extractor-container-length', extractor.href());
			}
		}
		else if (extractors && extractors.length == 0)
		{}
		else
		{
			console.log("bad-extractor-length", room.href());
		}
	},

	getRoomCreepExtractor: function (room)
	{
		const extractorCreeps = room.find(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					return creep.memory.role == 'extractor';
				}
			}
			);

		if (extractorCreeps && extractorCreeps.length == 1)
		{
			return extractorCreeps[0];
		}
		else if (extractorCreeps && extractorCreeps.length == 0)
		{}
		else
		{
			console.log('bad-creep-role-length', room.href(), extractorCreeps.length);
			for (const creep of extractorCreeps)
			{
				creep.recycle();
			}
			return extractorCreeps[0];
		}
	},

	run: function ()
	{
		for (const[name, room]of Object.entries(Game.rooms))
		{
			const result = this.getExtractorAndContainer(room);
			if (result)
			{
				const creep = this.getRoomCreepExtractor(room);
				const containerFreeCapacity = result.container.store.getFreeCapacity();

				if (!creep && containerFreeCapacity >= 1000)
				{
					const data =
					{
						role: 'extractor',
					};

					const body = [
						WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 25
						MOVE, MOVE, MOVE, MOVE, MOVE, // 5
					];

					room.smartSpawnRole(data, body);
				}
				else if (creep)
				{
					if (containerFreeCapacity >= 50)
					{
						creep.smartExtract();
					}
					creep.travel(result.container);
				}
			}
		}
	},
}

module.exports = core;
