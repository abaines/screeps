// Kizrak

'use strict';

var log = require('log').log;

var linkLogic =
{
	determineBehaviorOfLink: function (structureLink)
	{
		var roomName = structureLink.room.name;
		if (!(roomName in Memory.links))
		{
			Memory.links[roomName] = {};
		}

		if (Memory.links[roomName][structureLink.id] && Memory.links[roomName][structureLink.id].goal)
		{
			return;
		}

		var source = structureLink.pos.findClosestByRange(FIND_SOURCES);
		var controller = structureLink.room.controller;

		var sourceDistance = structureLink.pos.distance(source);
		var controllerDistance = structureLink.pos.distance(controller);

		console.log('determineBehaviorOfLink', structureLink, sourceDistance, controllerDistance);

		if (sourceDistance < 5 && controllerDistance > 20)
		{
			Memory.links[roomName][structureLink.id] =
			{
				goal: "sink",
				source: source.id,
			}
			return;
		}
		else if (controllerDistance < 5 && sourceDistance > 20)
		{
			Memory.links[roomName][structureLink.id] =
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

	runPerSink: function (sink, fountains)
	{
		fountains.forEach(fountain =>
		{
			if (fountain.store.getFreeCapacity(RESOURCE_ENERGY) >= 50)
			{
				sink.transferEnergy(fountain);
			}
		}
		);
	},

	runPerRoom: function (roomName, roomData)
	{
		var sinks = [];
		var fountains = [];

		for (const[linkId, linkData]of Object.entries(roomData))
		{
			var goal = linkData.goal;
			var linkObj = Game.getObjectById(linkId);

			if (goal == "sink")
			{
				sinks.push(linkObj);
			}
			else if (goal == "fountain")
			{
				fountains.push(linkObj);
			}
			else
			{
				console.log(linkId, goal, JSON.stringify(linkData));
			}
		}

		sinks.forEach(sink =>
		{
			if (sink.store[RESOURCE_ENERGY] >= 50)
			{
				this.runPerSink(sink, fountains);
			}
		}
		);
	},

	run: function ()
	{
		for (const[roomName, roomData]of Object.entries(Memory.links))
		{
			this.runPerRoom(roomName, roomData);
		}
	},
};

module.exports = linkLogic;
