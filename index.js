'use strict';

process.chdir(__dirname);

// Utils
const { logError } = require('./utils/log');

/**
 * @type {Telegraf}s
 * Bot
 */
const bot = require('./bot');

var express = require('express');
var app = express();

// set the host and port of our application
// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', (req, res) => {
	// ejs render automatically looks in the views folder
	res.render('index');
});

app.listen(PORT, HOST);

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
