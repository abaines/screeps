// Kizrak

'use strict';


// https://stackoverflow.com/a/29494612/
Number.prototype.toFixedNumber = function (digits, base)
{
	var pow = Math.pow(base || 10, digits);
	return Math.round(this * pow) / pow;
}

