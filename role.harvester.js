// Kizrak

'use strict';

function _getHarvesters()
{
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	return harvesters;
}

function smartTransfer(creep, target)
{
	if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
	{
		creep.moveTo(target,
		{
			visualizePathStyle:
			{
				stroke: '#ffffff'
			}
		}
		);
	}
}

function findStructuresThatNeedEnergy(creep, structureType)
{
	var room = creep.room;

	var target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES,
		{
			filter: (structure) =>
			{
				return (structure.structureType == structureType) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		}
		);

	return target;
}

function smartHarvest(creep, source)
{
	var harvestResult = creep.harvest(source);

	if (harvestResult == ERR_NOT_IN_RANGE)
	{
		creep.moveTo(source,
		{
			visualizePathStyle:
			{
				stroke: '#ffaa00'
			}
		}
		);
	}
	else if (harvestResult == OK)
	{}
	else if (harvestResult == ERR_BUSY)
	{
		var ret =
		{
			log: "The creep is still being spawned."
		};
		return ret;
	}
	else if (harvestResult == ERR_NOT_ENOUGH_RESOURCES)
	{
		var ret =
		{
			log: "The target does not contain any harvestable energy or mineral."
		};
		return ret;
	}
	else if (harvestResult == ERR_NO_BODYPART)
	{
		var ret =
		{
			log: "There are no WORK body parts in this creep’s body."
		};
		return ret;
	}
	else
	{
		var ret =
		{
			"log": ("creep.harvest = " + harvestResult)
		};
		return ret;
	}
}

function gotoFlag(creep, flag)
{
	var range = creep.pos.getRangeTo(flag);
	if (range > 1)
	{
		var moveReturn = creep.moveTo(flag,
			{
				visualizePathStyle:
				{
					stroke: '#ffaa00'
				}
			}
			);
		creep.say(creep.pos.x + '  ' + creep.pos.y + '  ' + range);
	}
}

function _findAndGotoFlag(creep)
{
	var flags = Game.flags;
	if (Object.keys(flags).length > 0)
	{
		var flag = flags[Object.keys(flags)[0]];
		gotoFlag(creep, flag);
	}
}

var roleHarvester =
{
	getHarvesters: _getHarvesters,
	findAndGotoFlag: _findAndGotoFlag,

	/** @param {Creep} creep **/
	run: function (creep)
	{
		if (creep.spawning)
		{
			return;
		}

		// planning phase
		if ((creep.store.getUsedCapacity() == 0 && creep.memory.mode == null) || (creep.memory.mode != null && Game.getObjectById(creep.memory.mode).energy == 0))
		{
			var sources = creep.room.find(FIND_SOURCES_ACTIVE);
			var item = sources[Math.floor(Math.random() * sources.length)];

			if (item != null)
			{
				creep.memory.mode = item.id;
			}
			else if (creep.room.find(FIND_CONSTRUCTION_SITES).length == 0)
			{
				_findAndGotoFlag(creep);
				return;
			}
		}
		if (creep.store.getFreeCapacity() == 0)
		{
			creep.memory.mode = null
		}

		// action phase
		if (creep.memory.mode != null)
		{
			var source = Game.getObjectById(creep.memory.mode);
			smartHarvest(creep, source);
		}
		else if (creep.store.getUsedCapacity() > 0)
		{
			var target = findStructuresThatNeedEnergy(creep, STRUCTURE_TOWER);
			if (target != null)
			{
				return smartTransfer(creep, target);
			}

			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if (targets.length)
			{
				var buildResult = creep.build(targets[0]);
				if (buildResult == ERR_NOT_IN_RANGE)
				{
					creep.moveTo(targets[0],
					{
						visualizePathStyle:
						{
							stroke: '#ffffff'
						}
					}
					);
				}
				else if (buildResult == ERR_NOT_ENOUGH_RESOURCES)
				{
					console.log('The creep does not have any carried energy.');
				}
				return;
			}

			var target = findStructuresThatNeedEnergy(creep, STRUCTURE_EXTENSION);
			if (target != null)
			{
				return smartTransfer(creep, target);
			}

			var target = findStructuresThatNeedEnergy(creep, STRUCTURE_SPAWN);
			if (target != null)
			{
				return smartTransfer(creep, target);
			}

			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
			{
				creep.moveTo(creep.room.controller,
				{
					visualizePathStyle:
					{
						stroke: '#ffffff'
					}
				}
				);
			}
		}
		else
		{
			console.log("Creep doesn't have anything to do.");
		}
	},

};

module.exports = roleHarvester;
