'use strict';

const { Composer } = require('telegraf');

const composer = new Composer();

const addCustomCmdHandler = require('./addCustomCmd');
const addWelcomeMsgHandler = require('./addWelcomeMsg');

composer.on('message', addCustomCmdHandler, addWelcomeMsgHandler);

module.exports = composer;
