// Kizrak

'use strict';

Number.prototype.toFixedNumber = function (digits, base)
{
	// https://stackoverflow.com/a/29494612/
	var pow = Math.pow(base || 10, digits);
	return Math.round(this * pow) / pow;
}

RoomPosition.prototype.distanceToPos = function (other)
{
	if (this.room != other.room)
	{
		var msg = "Rooms must be the same for RoomPosition::distanceToPos\n" + this.room + '\n' + other.room;
		console.log(msg);
		throw new Error(msg);
	}

	var x2x = Math.abs(this.x - other.x);
	var y2y = Math.abs(this.y - other.y);
	var distance = Math.sqrt(x2x * x2x + y2y * y2y);

	return distance;
}

RoomPosition.prototype.distanceToStructure = function (structure)
{
	return this.distanceToPos(structure.pos);
}

Creep.prototype.moveAndWithdraw = function (target, resourceType = RESOURCE_ENERGY)
{
	var withdrawResult = this.withdraw(target, resourceType);

	if (ERR_NOT_IN_RANGE == withdrawResult)
	{
		this.say("⚡");
		var moveResult = this.moveAndLog(target);
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

Creep.prototype.moveAndLog = function (target, opts)
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
		creep.say('🚫');
		console.log('Creep.prototype.moveAndLog', 'No path to the target could be found.', this.name, target);
	}
	else
	{
		creep.say('🛑');
		console.log('Creep.prototype.moveAndLog', this.name, target, moveResult);
	}

	return moveResult;
}
