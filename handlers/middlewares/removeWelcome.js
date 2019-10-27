'use strict';

const { deleteWelcomeMsgs } = require('../../config');
const { isWelcomeMsg } = require('../../utils/tg.js');
const { unmatched } = require('../unmatched');

const shouldDelete = {
	all: () => true,
	none: () => false,
	own: ctx => !ctx.state[unmatched]
};

if (!(deleteWelcomeMsgs in shouldDelete)) {
	throw new Error('Invalid value for `deleteWelcomeMsgs` in config file: ' + deleteWelcomeMsgs);
}

const noop = Function.prototype;

const removeWelcomeHandler = async (ctx, next) => {
	await next();
	if (
		shouldDelete[deleteWelcomeMsgs](ctx) &&
		isWelcomeMsg(ctx.message) &&
		ctx.chat.type !== 'private'
	) {
		ctx.deleteMessage().catch(noop);
	}
};

module.exports = removeWelcomeHandler;
