'use strict';

const mongoClient = require('mongodb').MongoClient;

function* init() {
	const accounts = (yield mongoClient.connect(process.env.MONGOLAB_URI)).db().collection('accounts');

	function* connect(credentials) {
		const account = (yield accounts.findOne({name: credentials.name})) || function () {throw Error('ARGG')}();
		return account;
	}

	function* create(credentials) {
		yield accounts.insert(credentials);
	}

	function* update(account, data) {
		yield accounts.updateOne(
			{ name: account.name },
			{ $set: {data} }
		);
	}

	return {
		connect,
		create,
		update
	};
};

module.exports = init;

