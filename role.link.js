// Kizrak

'use strict';

var linkLogic =
{
	determineBehaviorOfLink: function (structureLink)
	{
		if (Memory.links[structureLink.id] && Memory.links[structureLink.id].goal)
		{
			return;
		}

		var source = structureLink.pos.findClosestByRange(FIND_SOURCES);
		var controller = structureLink.room.controller;

		var sourceDistance = structureLink.pos.distanceToStructure(source);
		var controllerDistance = structureLink.pos.distanceToStructure(controller);

		console.log('determineBehaviorOfLink', structureLink, sourceDistance, controllerDistance);

		if (sourceDistance < 5 && controllerDistance > 20)
		{
			Memory.links[structureLink.id] =
			{
				goal: "sink",
				source: source.id,
			}
			return;
		}
		else if (controllerDistance < 5 && sourceDistance > 20)
		{
			Memory.links[structureLink.id] =
			{
				goal: "fountain",
				controller: controller.id,
			}
			return;
		}
		else
		{
			console.log("Unable to classify link:", structureLink);
		}
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
