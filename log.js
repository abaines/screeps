// Kizrak

'use strict';

Memory.logs = {}

function log(msgType, msg, timeout)
{
	msg = msg || msgType;
	timeout = timeout || 300; // ~1 minute

	if (!(msgType in Memory.logs))
	{
		Memory.logs[msgType] = -Infinity;
	}

	if (Game.time - Memory.logs[msgType] > timeout)
	{
		console.log(msg);
		Memory.logs[msgType] = Game.time;
	}
}
exports.log = log;
