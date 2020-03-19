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
	runPerCreep: function (creep)
	{},
	run: function ()
	{
		for (const[name, room]of Object.entries(Game.rooms))
		{
			const result = this.getExtractorAndContainer(room);
			if (result)
			{
				console.log(result.extractor.href(), result.container.href());
			}
		}
	},
}

module.exports = core;
