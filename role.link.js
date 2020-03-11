// Kizrak

'use strict';

var linkLogic =
{
	determineBehaviorOfLink: function (structureLink)
	{
		if (Memory.links[structureLink.id])
		{
			return;
		}

		var source = structureLink.pos.findClosestByRange(FIND_SOURCES);
		var sourceDistance = structureLink.pos.distanceToStructure(source);
		var controllerDistance = structureLink.pos.distanceToStructure(structureLink.room.controller);

		console.log(structureLink, sourceDistance, controllerDistance);
	},
	determineBehavior: function ()
	{
		for (const[key, structure]of Object.entries(Game.structures))
		{
			if (STRUCTURE_LINK == structure.structureType)
			{
				this.determineBehaviorOfLink(structure);
			}
		}
	},
};

module.exports = linkLogic;
