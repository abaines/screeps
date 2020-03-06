// Kizrak

function _getHarvesters()
{
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	return harvesters;
}

function transfer(creep, target)
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

function findStructuresThatNeedEnergy(room, structureType)
{
	var targets = room.find(FIND_MY_STRUCTURES,
		{
			filter: (structure) =>
			{
				return (structure.structureType == structureType) &&
				structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		}
		);
	return targets;
}

var roleHarvester =
{
	getHarvesters: _getHarvesters,

	/** @param {Creep} creep **/
	run: function (creep)
	{
		if (creep.spawning)
		{
			return;
		}
		if (creep.store.getUsedCapacity() == 0 && creep.memory.mode == null)
		{
			var sources = creep.room.find(FIND_SOURCES_ACTIVE);
			var item = sources[Math.floor(Math.random() * sources.length)];
			creep.memory.mode = item.id;
		}
		if (creep.store.getFreeCapacity() == 0)
		{
			creep.memory.mode = null
		}

		if (creep.memory.mode != null)
		{
			var source = Game.getObjectById(creep.memory.mode);
			var h = creep.harvest(source);
			if (h == ERR_NOT_IN_RANGE)
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
			else if (h == OK)
			{}
			else if (h == ERR_BUSY)
			{
				var ret =
				{
					log: "The creep is still being spawned."
				};
				return ret;
			}
			else if (h == ERR_NOT_ENOUGH_RESOURCES)
			{
				var ret =
				{
					log: "The target does not contain any harvestable energy or mineral."
				};
				return ret;
			}
			else if (h == ERR_NO_BODYPART)
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
					"log": ("creep.harvest = " + h)
				};
				return ret;
			}
		}
		else //if (creep.memory.mode == 2)
		{
			var targets = findStructuresThatNeedEnergy(creep.room, STRUCTURE_TOWER);
			if (targets.length > 0)
			{
				return transfer(creep, targets[0]);
			}

			var targets = findStructuresThatNeedEnergy(creep.room, STRUCTURE_EXTENSION);
			if (targets.length > 0)
			{
				return transfer(creep, targets[0]);
			}

			var targets = findStructuresThatNeedEnergy(creep.room, STRUCTURE_SPAWN);
			if (targets.length > 0 && _getHarvesters().length < 12)
			{
				return transfer(creep, targets[0]);
			}

			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if (targets.length)
			{
				if (creep.build(targets[0]) == ERR_NOT_IN_RANGE)
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
				return;
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
	},

};

module.exports = roleHarvester;
