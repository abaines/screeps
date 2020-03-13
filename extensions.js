// Kizrak

'use strict';

var log = require('log').log;

Number.prototype.toFixedNumber = function (digits, base)
{
	// https://stackoverflow.com/a/29494612/
	var pow = Math.pow(base || 10, digits);
	return Math.round(this * pow) / pow;
}

RoomPosition.prototype.distance = function (other)
{
	const otherPos = other.pos || other;

	if (this.room != otherPos.room)
	{
		var msg = "Rooms must be the same for RoomPosition::distanceToPos\n" + this.room + '\n' + otherPos.room;
		console.log(msg);
		throw new Error(msg);
		return Infinity;
	}

	var x2x = Math.abs(this.x - otherPos.x);
	var y2y = Math.abs(this.y - otherPos.y);
	var distance = Math.sqrt(x2x * x2x + y2y * y2y);

	return distance;
}

Creep.prototype.moveAndWithdraw = function (target, resourceType = RESOURCE_ENERGY)
{
	var withdrawResult = this.withdraw(target, resourceType);

	if (ERR_NOT_IN_RANGE == withdrawResult)
	{
		this.say("⚡");
		var moveResult = this.travel(target);
	}
	else if (OK == withdrawResult)
	{
		// acceptable
		this.say("⚡");
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

	var moveResult = this.moveTo(target, opts);

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

Room.prototype.href = function ()
{
	const roomName = this.name;
	return '<a href="#!/room/' + roomName + '">' + roomName + '</a>'
}
