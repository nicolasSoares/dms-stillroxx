'use strict';

const mongoClient = require('mongodb').MongoClient;
const jwtSign = require('jsonwebtoken').sign;
const bcrypt = require('bcryptjs');
const secretBuffer = new Buffer('secret').toString('base64');


function* init() {
	const accounts = (yield mongoClient.connect(process.env.MONGOLAB_URI)).db().collection('accounts');

	function* connect(credentials) {
		const account = (yield accounts.findOne({name: credentials.name})) || function () {throw Error('ARGG')}();
		if (!(yield bcrypt.compare(credentials.pwd, account.pwd))) {
			throw new Error('GET OUT !');
		}
		delete account.pwd;
		delete account._id;
		account.token = jwtSign(account, secretBuffer, {expiresIn: '5 day'});
		return account;
	}

	function* create(credentials) {
		credentials.pwd = yield bcrypt.hash(credentials.pwd, 8)
		yield accounts.insert(credentials);
	}

	function* update(account, data) {
		yield accounts.updateOne(
			{ name: account.name },
			{ $set: {data} }
		);
	}

	function* getCrons() {
		const crons = yield accounts.find({"crontime": { $exists : true, $ne : null }}).toArray();
		return crons;	
	}

	return {
		connect,
		create,
		update,
		getCrons
	};
};

module.exports = init;

