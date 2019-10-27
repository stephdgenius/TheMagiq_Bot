'use strict';

const { Composer } = require('telegraf');

const composer = new Composer();

const { deleteAfter } = require('../../utils/tg');
const { deleteJoinsAfter = '2 minutes' } = require('../../config');

const addedToGroupHandler = require('./addedToGroup');
const antibotHandler = require('./antibot');
const sendWelcomeMessageHandler = require('./sendWelcomeMessage');
const checkLinksHandler = require('./checkLinks');
const commandButtons = require('./commandButtons');
const welcomeButtons = require('./welcomeButtons');
const kickBannedHandler = require('./kickBanned');
const kickedFromGroupHandler = require('./kickedFromGroup');
const leaveUnmanagedHandler = require('./leaveUnmanaged');
const removeChannelForwardsHandler = require('./removeChannelForwards');
const removeCommandsHandler = require('./removeCommands');
const removeWelcomeHandler = require('./removeWelcome');
const syncStatusHandler = require('./syncStatus');
const updateUserDataHandler = require('./updateUserData');
const presenceLogHandler = require('./logPresence');
const updateGroupTitleHandler = require('./updateGroupTitle');

composer.on('new_chat_members', addedToGroupHandler);
composer.on('left_chat_member', kickedFromGroupHandler);
composer.use(leaveUnmanagedHandler);
composer.use(updateUserDataHandler);
composer.on(
	'new_chat_members',
	syncStatusHandler,
	antibotHandler,
	sendWelcomeMessageHandler
);
composer.on('message', kickBannedHandler);
composer.use(removeChannelForwardsHandler);
composer.on([ 'edited_message', 'message' ], checkLinksHandler);
composer.on('new_chat_title', updateGroupTitleHandler);
composer.on('text', removeCommandsHandler, removeWelcomeHandler);
composer.on(
	[ 'new_chat_members', 'left_chat_member' ],
	deleteAfter(deleteJoinsAfter),
	presenceLogHandler
);
composer.on('callback_query', commandButtons, welcomeButtons);

module.exports = composer;
