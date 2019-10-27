'use strict';

// DB
const { addWelcomeMsg, getWelcomeMsg } = require('../../stores/welcome');

// Bot
const { Markup } = require('telegraf');
const { replyOptions } = require('../../bot/options');

const { isMaster } = require('../../utils/config');

const preserved = require('.').handlers;

const addWelcomeHandler = async ctx => {
	const { chat, message, reply } = ctx;
	if (chat.type !== 'private') return null;
	const { id } = ctx.from;

	if (ctx.from.status !== 'admin') {
		return reply(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions
		);
	}

	const [ slashWelcome, welcomName = '' ] = message.text.split(' ');
	const isValidName = /^!?(\w+)$/.exec(welcomName);
	if (!isValidName) {
		return reply(
			'<b>Send a valid welcome name.</b>\n\nExample:\n' +
				'<code>/addwelcome hello</code>',
			replyOptions
		);
	}
	const newWelcome = isValidName[1].toLowerCase();
	console.log('newWelcome: ', newWelcome);
	if (preserved.has(newWelcome)) {
		return reply('❗️ Sorry you can\'t use this name, it\'s preserved.\n\n' +
				'Try another one.');
	}

	const replaceWelcome = slashWelcome.toLowerCase() === '/replacewelcome';

	const welcomeExists = await getWelcomeMsg({
		isActive: true,
		name: newWelcome
	});

	if (!replaceWelcome && welcomeExists) {
		return ctx.replyWithHTML(
			'ℹ️ <b>This welcome name already exists.</b>\n\n' +
				'/welcomes - to see the list of commands.\n' +
				'/addwelcome <code>&lt;name&gt;</code>' +
				'- to add a welcome message.\n' +
				'/removewelcome <code>&lt;name&gt;</code>' +
				' - to remove a welcome message.',
			Markup.keyboard([ [ `/replacewelcome ${newWelcome}` ] ])
				.oneTime()
				.resize()
				.extra()
		);
	}
	if (welcomeExists && welcomeExists.role === 'master' && !isMaster(ctx.from)) {
		return ctx.reply(
			'ℹ️ <b>Sorry, only master can replace this welcome message.</b>',
			replyOptions
		);
	}
	await addWelcomeMsg({ id, name: newWelcome, state: 'role' });
	return reply(
		'Who can use this welcome message?',
		Markup.keyboard([ [ 'Master', 'Admins' ] ])
			.oneTime()
			.resize()
			.extra()
	);
};

module.exports = addWelcomeHandler;
