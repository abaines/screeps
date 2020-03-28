// Kizrak

'use strict';

const log = require('log').log;

const linkLogic =
{
	determineBehaviorOfLink: function (structureLink)
	{
		const roomName = structureLink.room.name;
		if (!(roomName in Memory.links))
		{
			Memory.links[roomName] = {};
		}

		if (Memory.links[roomName][structureLink.id] && Memory.links[roomName][structureLink.id].goal)
		{
			return;
		}

		const source = structureLink.pos.findClosestByRange(FIND_SOURCES);
		const controller = structureLink.room.controller;

		const sourceDistance = structureLink.pos.distance(source);
		const controllerDistance = structureLink.pos.distance(controller);

		console.log('determineBehaviorOfLink', structureLink.href(), sourceDistance, controllerDistance);

		if (sourceDistance < 5 && sourceDistance < controllerDistance)
		{
			Memory.links[roomName][structureLink.id] =
			{
				goal: "sink",
				source: source.id,
			}
			return;
		}
		else if (controllerDistance < 5 && controllerDistance < sourceDistance)
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
			console.log("Unable to classify link:", structureLink.href());
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
		const sinks = [];
		const fountains = [];

		for (const[linkId, linkData]of Object.entries(roomData))
		{
			const goal = linkData.goal;
			const linkObj = Game.getObjectById(linkId);

			if ("sink" == goal)
			{
				sinks.push(linkObj);
			}
			else if ("fountain" == goal)
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
