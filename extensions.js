// Kizrak

'use strict';

const log = require('log').log;

Number.prototype.toFixedNumber = function (digits, base)
{
	// https://stackoverflow.com/a/29494612/
	const pow = Math.pow(base || 10, digits);
	return Math.round(this * pow) / pow;
}

RoomPosition.prototype.distance = function (other)
{
	const otherPos = other.pos || other;

	if (this.room != otherPos.room)
	{
		const msg = "Rooms must be the same for RoomPosition::distanceToPos\n" + this.room + '\n' + otherPos.room;
		log(msg);
		return Infinity;
	}

	const x2x = Math.abs(this.x - otherPos.x);
	const y2y = Math.abs(this.y - otherPos.y);
	const distance = Math.sqrt(x2x * x2x + y2y * y2y);

	return distance;
}

Creep.prototype.smartWithdraw = function (target, resourceType = RESOURCE_ENERGY, say = "⚡")
{
	const withdrawResult = this.withdraw(target, resourceType);

	if (ERR_NOT_IN_RANGE == withdrawResult)
	{
		this.say(say);
		const moveResult = this.travel(target);
	}
	else if (OK == withdrawResult)
	{
		// acceptable
		this.say(say);
	}
	else
	{
		this.say("💫" + withdrawResult);
	}

	return withdrawResult
}

Creep.prototype.travel = function (target, opts)
{
	opts = opts ||
	{
		visualizePathStyle:
		{
			stroke: '#ffaa00'
		}
	};

	const moveResult = this.moveTo(target, opts);

	if (OK == moveResult || ERR_TIRED == moveResult)
	{
		// acceptable
		return OK;
	}
	else if (ERR_NO_PATH == moveResult)
	{
		this.say('🚫');

		const creepAreaCreepsCount = this.pos.findInRange(FIND_MY_CREEPS, 1.9).length - 1;
		const targetAreaCreepsCount = target.pos.findInRange(FIND_MY_CREEPS, 1.9).length;

		const distance = this.pos.distance(target.pos);

		if (creepAreaCreepsCount > 0 && targetAreaCreepsCount > 0 && distance < 3)
		{
			// hopefully just congestion
		}
		else if (creepAreaCreepsCount + targetAreaCreepsCount >= 1 && distance < 3)
		{
			// hopefully just congestion
		}
		else
		{
			log('Creep.prototype.travel No path to the target could be found. ' + this.room.href() + ' ' + this.name + ' ' + target + ' ' + creepAreaCreepsCount + ' ' + targetAreaCreepsCount + ' ' + distance);
		}
	}
	else
	{
		this.say('🛑');
		log('Creep.prototype.travel' + ' ' + this.room.href() + ' ' + this.name + ' ' + target + ' ' + moveResult);
	}

	return moveResult;
}

Creep.prototype.bodyScan = function (scan_type)
{
	for (const[part, type]of Object.entries(this.body))
	{
		if (type == scan_type)
		{
			return true;
		}
	}
	return false;
}

Creep.prototype.smartTransfer = function (target, say = "🔋")
{
	const transferResult = this.transfer(target, RESOURCE_ENERGY);

	if (ERR_NOT_IN_RANGE == transferResult)
	{
		this.say(say);
		this.travel(target);
	}
	else if (OK == transferResult)
	{
		this.say(say);
	}
	else if (ERR_INVALID_TARGET == transferResult)
	{
		this.say("🥛");
		const msg = 'transferResult The target is not a valid object which can contain the specified resource. ' + target;
		log(msg);
	}
	else if (ERR_NOT_ENOUGH_RESOURCES == transferResult)
	{
		this.say("🥛");
		const msg = 'transferResult The creep does not have the given amount of resources. ' + target + ' ' + this.room.href();
		log(msg);
	}
	else
	{
		this.say("🥛");
		log('transferResult ' + transferResult);
	}
}

Creep.prototype.smartBuild = function (structure, say = "🚧")
{
	const buildResult = this.build(structure);

	if (buildResult == ERR_NOT_IN_RANGE)
	{
		this.say(say);
		this.travel(structure);
	}
	else if (OK == buildResult)
	{
		this.say(say);
	}
	else if (ERR_NOT_ENOUGH_RESOURCES == buildResult)
	{
		this.say("🔌");
		log('The creep does not have any carried energy. ' + this.room.href());
	}
	else
	{
		log('creep-build-failed ' + buildResult + ' ' + this.room.href());
		this.say("💫" + buildResult);
	}
}

Creep.prototype.smartHarvest = function (source, say = "🌿")
{
	const harvestResult = this.harvest(source);

	if (harvestResult == ERR_NOT_IN_RANGE)
	{
		this.say(say);
		this.travel(source);
	}
	else if (harvestResult == OK)
	{
		this.say(say);
	}
	else if (harvestResult == ERR_BUSY)
	{
		// ignore "The creep is still being spawned."
	}
	else if (harvestResult == ERR_NOT_ENOUGH_RESOURCES)
	{
		this.say("💢");
		log("The target does not contain any harvestable energy or mineral. " + this.room.href());
	}
	else if (harvestResult == ERR_NO_BODYPART)
	{
		this.say("💢🔨");
		log("There are no WORK body parts in this creep’s body. " + this.room.href());
	}
	else
	{
		this.say("💢🌿");
		log("creep.harvest = " + harvestResult + ' ' + this.room.href());
	}
}

Room.prototype.href = function ()
{
	const roomName = this.name;
	return '<a href="#!/room/' + roomName + '">' + roomName + '</a>'
}
