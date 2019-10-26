'use strict';

process.chdir(__dirname);

// Utils
const { logError } = require('./utils/log');

/**
 * @type {Telegraf}s
 * Bot
 */
const bot = require('./bot');

// Import Express JS
const express = require('express');
const app = express();
const { join } = require('path');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.set('views', join(__dirname, './views'));
app.engine('.ejs', require('ejs').__express);

// make express look in the public directory for assets (css/js/img)
app.use(express.static('public'));

// set the home page route
app.get('/', (req, res) => {
	// ejs render automatically looks in the views folder
	res.render('index');
});

app.listen(port);

// Launch Bot
bot.telegram
	.getMe()
	.then(botInfo => {
		bot.options.username = botInfo.username;
		bot.context.botInfo = botInfo;
	})
	.then(() => {
		bot.startPolling();
	});

bot.use(
	require('./handlers/middlewares'),
	require('./handlers/messages'),
	require('./plugins'),
	require('./handlers/commands'),
	require('./handlers/regex'),
	require('./handlers/unmatched')
);

bot.catch(logError);
