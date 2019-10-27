'use strict';

const { hears } = require('telegraf');
const R = require('ramda');

// DB
const { getWelcomeMsg } = require('../../stores/welcome');

const { scheduleDeletion } = require('../../utils/tg');

const config = require('../../config');

const deleteCustom = config.deleteCustom || { longerThan: Infinity };

const capitalize = R.replace(/^./, R.toUpper);

const getRepliedToId = R.path([ 'reply_to_message', 'message_id' ]);

const typeToMethod = type =>
	type === 'text' ? 'replyWithHTML' : `replyWith${capitalize(type)}`;

const runWelcomeMsgHandler = async (ctx, next) => {
	const { message, state } = ctx;
	const { isAdmin, isMaster } = state;

	const welcomeName = ctx.match[1].toLowerCase();
	const welcome = await getWelcomeMsg({ isActive: true, name: welcomeName });

	if (!welcome) {
		return next();
	}

	const { caption, content, type } = welcome;
	const role = welcome.role.toLowerCase();
	if (role === 'master' && !isMaster || role === 'admins' && !isAdmin) {
		return next();
	}

	const reply_to_message_id = getRepliedToId(message);
	const options = {
		caption,
		disable_web_page_preview: true,
		reply_to_message_id
	};

	if (type === 'text' && content.length > deleteCustom.longerThan) {
		return ctx
			.replyWithHTML(content, options)
			.then(scheduleDeletion(deleteCustom.after));
	}

	return ctx[typeToMethod(type)](content, options);
};

module.exports = hears(/^!! ?(\w+)/, runWelcomeMsgHandler);
