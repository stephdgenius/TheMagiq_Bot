'use strict';

const Datastore = require('nedb-promise');

const Welcome = new Datastore({
	autoload: true,
	filename: 'data/Welcome.db'
});

Welcome.ensureIndex({
	fieldName: 'name',
	unique: true
});

const addWelcomeMsg = welcome =>
	Welcome.update(
		{ name: welcome.name },
		Object.assign({}, welcome, { isActive: false }),
		{ upsert: true }
	);

const updateWelcomeMsg = data =>
	Welcome.update({ id: data.id, isActive: false }, { $set: data });

const removeWelcomeMsg = welcome => Welcome.remove(welcome);

const getWelcomeMsg = data => Welcome.findOne(data);

const listWelcomeMsg = () =>
	Welcome.cfind({ isActive: true })
		.sort({ name: 1 })
		.exec();

module.exports = {
	addWelcomeMsg,
	getWelcomeMsg,
	listWelcomeMsg,
	removeWelcomeMsg,
	updateWelcomeMsg
};
