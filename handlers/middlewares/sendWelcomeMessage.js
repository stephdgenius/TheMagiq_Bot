'use strict';

// DB
const { getWelcomeMsg } = require('../../stores/welcome');

const sendWelcomeMessageHandler = async (ctx, next) => {
	const msg = ctx.message;

	const users = msg.new_chat_members.filter(user => user.username !== ctx.me);

	console.log(`lang en: ${ctx.chat.username}_en`);
	console.log(`lang fr: ${ctx.chat.username}_fr`);

	const welcome_en = await getWelcomeMsg({
		isActive: true,
		name: `${ctx.chat.username}_en`
	});

	const welcome_fr = await getWelcomeMsg({
		isActive: true,
		name: `${ctx.chat.username}_fr`
	});

	if (!welcome_en) {
		return next();
	}

	if (!welcome_fr) {
		return next();
	}

	if (users.length === 0) {
		return next();
	}

	for (const user of users) {
		console.log('user: ', user);
		switch (user.language_code) {
		case 'en':
			ctx.telegram.sendMessage(user.id, welcome_en.content);
			break;

		case 'fr':
			ctx.telegram.sendMessage(user.id, welcome_fr.content);
			break;

		default:
			break;
		}
	}

	return next();
};

module.exports = sendWelcomeMessageHandler;
