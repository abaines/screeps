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
