// Kizrak

'use strict';


Number.prototype.toFixedNumber = function (digits, base)
{
	// https://stackoverflow.com/a/29494612/
	var pow = Math.pow(base || 10, digits);
	return Math.round(this * pow) / pow;
}

