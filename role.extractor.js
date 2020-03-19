// Kizrak

'use strict';

const log = require('log').log;

const core =
{
	getExtractorAndContainer: function (room)
	{
		const extractors = room.find(FIND_MY_STRUCTURES,
			{
				filter:
				{
					structureType: STRUCTURE_EXTRACTOR
				}
			}
			);

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
		const extractors = room.find(FIND_MY_CREEPS,
			{
				filter: (creep) =>
				{
					return creep.memory.role == 'extractor';
				}
			}
			);

		if (extractors && extractors.length == 1)
		{
			return extractors[0];
		}
		else if (extractors && extractors.length == 0)
		{}
		else
		{
			console.log('bad-creep-role-length', room.href());
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
					const spawners = room.find(FIND_MY_STRUCTURES,
						{
							filter:
							{
								structureType: STRUCTURE_SPAWN
							}
						}
						);

					if (spawners && spawners.length > 0)
					{
						for (const[name, spawner]of Object.entries(spawners))
						{
							spawner.smartSpawnCreep('extractor',
								[
									WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 25
									MOVE, MOVE, MOVE, MOVE, MOVE, // 5
								]);
						}
					}
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
