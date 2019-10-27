'use strict';

const R = require('ramda');

// DB
const { listCommands } = require('../../stores/command');
const { listWelcomeMsg } = require('../../stores/welcome');

// cfg
const { isMaster } = require('../../utils/config');

const { scheduleDeletion } = require('../../utils/tg');

const masterCommands = `\
<b>Master commands</b>:
<code>/admin</code> - Makes the user admin.
<code>/unadmin</code> - Demotes the user from admin list.
<code>/leave &lt;name|id&gt;</code> - Makes the bot leave the group cleanly.
<code>/hidegroup</code> - Hide the group from <code>/groups</code> list.
<code>/showgroup</code> - Show the group it in <code>/groups</code> list.\n
`;

const adminCommands = `\
<b>Admin commands</b>:
<code>/warn &lt;reason&gt;</code> - Warns the user.
<code>/unwarn</code> - Removes the last warn from the user.
<code>/nowarns</code> - Clears warns for the user.
<code>/ban &lt;reason&gt;</code> - Bans the user from groups.
<code>/unban</code> - Removes the user from ban list.
<code>/user</code> - Shows user's status and warns.
<code>/addcommand &lt;name&gt;</code> - to create a custom command.
<code>/removecommand &lt;name&gt;</code> - to remove a custom command.
<code>/addwelcome &lt;name&gt;</code> - to create a welcome message.
<code>/removewelcome &lt;name&gt;</code> - to remove a welcome message.\n
`;
const userCommands = `\
<b>Commands for everyone</b>:
<code>/staff</code> - Shows a list of admins.
<code>/link</code> - Show the current group's link.
<code>/groups</code> - Show a list of groups which the bot is admin in.
<code>/report</code> - Reports the replied-to message to admins.\n
`;
const role = R.prop('role');
const name = R.prop('name');

const commandReferenceHandler = async ctx => {
	const customCommands = await listCommands();
	const welcomeMessages = await listWelcomeMsg();

	const customCommandsGrouped = R.groupBy(role, customCommands);
	const userCustomCommands = customCommandsGrouped.everyone
		? '[everyone]\n<code>' +
		  customCommandsGrouped.everyone.map(name).join(', ') +
		  '</code>\n\n'
		: '';

	const adminCustomCommands = customCommandsGrouped.admins
		? '[admins]\n<code>' +
		  customCommandsGrouped.admins.map(name).join(', ') +
		  '</code>\n\n'
		: '';

	const masterCustomCommands = customCommandsGrouped.master
		? '[master]\n<code>' +
		  customCommandsGrouped.master.map(name).join(', ') +
		  '</code>\n\n'
		: '';

	const welcomeMessagesGrouped = R.groupBy(role, welcomeMessages);
	const adminWelcomeMsg = welcomeMessagesGrouped.admins
		? '[admins]\n<code>' +
		  welcomeMessagesGrouped.admins.map(name).join(', ') +
		  '</code>\n\n'
		: '';

	const masterWelcomeMsg = welcomeMessagesGrouped.master
		? '[master]\n<code>' +
		  welcomeMessagesGrouped.master.map(name).join(', ') +
		  '</code>\n\n'
		: '';

	const customCommandsText =
		masterCommands.repeat(isMaster(ctx.from)) +
		adminCommands.repeat(ctx.from && ctx.from.status === 'admin') +
		userCommands +
		'\n<b>Custom commands (prefix with !):</b>\n' +
		masterCustomCommands.repeat(isMaster(ctx.from)) +
		adminCustomCommands.repeat(ctx.from && ctx.from.status === 'admin') +
		userCustomCommands +
		'\n<b>Welcome messages (prefix with !!):</b>\n' +
		masterWelcomeMsg.repeat(isMaster(ctx.from)) +
		adminWelcomeMsg.repeat(ctx.from && ctx.from.status === 'admin');

	return ctx.replyWithHTML(customCommandsText).then(scheduleDeletion());
};

module.exports = commandReferenceHandler;
