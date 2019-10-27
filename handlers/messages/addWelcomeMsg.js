'use strict';

const { Markup } = require('telegraf');
const { last } = require('ramda');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const {
	getWelcomeMsg,
	removeWelcomeMsg,
	updateWelcomeMsg
} = require('../../stores/welcome');

const createNewWelcomeMsg = ctx => {
	const { message } = ctx;
	const { caption, text, photo } = message;
	const [ type ] = ctx.updateSubTypes;

	if (text) {
		return { content: text, type: 'text' };
	}
	if (photo) {
		return {
			caption,
			content: last(photo).file_id,
			type: 'photo'
		};
	}
	return { caption, content: message[type].file_id, type };
};

const addWelcomeMsgHandler = async (ctx, next) => {
	if (ctx.chat.type !== 'private') return next();

	const { message, reply, from } = ctx;
	const { text } = message;
	const { id } = from;
	const isAdmin = from.status === 'admin';

	if (text && /^\/\w+/.test(text)) {
		await removeWelcomeMsg({ id, isActive: false });
		return next();
	}

	const welcomeMsg = await getWelcomeMsg({ id, isActive: false });
	if (!isAdmin || !welcomeMsg || !welcomeMsg.state) {
		return next();
	}

	if (welcomeMsg.state === 'role') {
		const role = text.toLowerCase();
		if (role !== 'master' && role !== 'admins') {
			reply(
				'Please send a valid role.',
				Markup.keyboard([ [ 'Master', 'Admins' ] ])
					.oneTime()
					.resize()
					.extra()
			);
			return next();
		}
		await updateWelcomeMsg({ id, role, state: 'content' });
		return reply(
			'Send the content you wish to be shown when the welcome message is used.' +
				'.\n\nSupported contents:\n- <b>Text (HTML)</b>\n- <b>Photo</b>' +
				'\n- <b>Video</b>\n- <b>Document</b>\n- <b>Audio</b>',
			replyOptions
		);
	}

	if (welcomeMsg.state === 'content') {
		if (ctx.message.text) {
			try {
				await ctx.replyWithHTML(ctx.message.text);
			} catch (err) {
				return ctx.reply(err + '\n\nPlease fix your content and try again.');
			}
		}

		const newWelcomeMsg = createNewWelcomeMsg(ctx);

		await updateWelcomeMsg({
			...newWelcomeMsg,
			id,
			isActive: true,
			state: null
		});
		return reply(
			'✅ <b>New welcome message has been created successfully.</b>\n\n' +
				'Welcome messages work with !! instead of /.\n\n' +
				'For example: <code>!!hello</code>\n\n' +
				'Welcome messages can reply other messages too.\n\n' +
				'/commands - to see the list of welcome messages.\n' +
				'/addwelcome - to add a new welcome message.\n' +
				'/removewelcome <code>&lt;name&gt;</code> - to remove a welcome message.',
			replyOptions
		);
	}
	return next();
};

module.exports = addWelcomeMsgHandler;
