'use strict';

// DB
const { getWelcomeMsg, removeWelcomeMsg } = require('../../stores/welcome');

// Bot
const { replyOptions } = require('../../bot/options');

const removeWelcomeMessageHandler = async ({ chat, message, reply, state }) => {
	const { isAdmin, isMaster } = state;
	const { text } = message;
	if (chat.type !== 'private') return null;

	if (!isAdmin) {
		return reply(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions
		);
	}
	const [ , welcomeName ] = text.split(' ');
	if (!welcomeName) {
		return reply(
			'<b>Send a valid welcome message.</b>\n\nExample:\n' +
				'<code>/removewelcome rules</code>',
			replyOptions
		);
	}

	const welcome = await getWelcomeMsg({ name: welcomeName.toLowerCase() });
	if (!welcome) {
		return reply('ℹ️ <b>Welcome message couldn\'t be found.</b>', replyOptions);
	}

	const role = welcome.role.toLowerCase();
	if (role === 'master' && !isMaster) {
		return reply(
			'ℹ️ <b>Sorry, only master can remove this welcome message.</b>',
			replyOptions
		);
	}

	await removeWelcomeMsg({ name: welcomeName.toLowerCase() });
	return reply(
		`✅ <code>!!${welcomeName}</code> ` +
			'<b>has been removed successfully.</b>',
		replyOptions
	);
};

module.exports = removeWelcomeMessageHandler;
