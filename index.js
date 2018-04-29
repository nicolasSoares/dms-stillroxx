'use strict';

const t = [
	{
		mail: "byers@langly.fr",
		pwd: "noob1234",
	},
	{
		mail: "langly@langly.fr",
		pwd: "titi1234",
	}
];

const app = require('express')();
const co = require('co');
const mongoClient = require("mongodb").MongoClient
const port = process.env.PORT || 3002;

co(function* () {
	const db = (yield mongoClient.connect(process.env.MONGOLAB_URI)).db();

  app.get('/', wrapAsync(function* (req, res, next) {
  	
//  	yield db.collection('accounts').insert(t[1]);
//  	const accounts = yield db.collection('accounts').find().toArray();

	const el = yield db.collection('accounts').find().limit(1).
  }));

  app.listen(port, _ => console.log('App is listening on port ', port));
  
}).catch(err => {
	console.error(err);
});

function wrapAsync(fn) {
	return (req, res, next) => {
		co(function*() {
			yield fn(req, res, next);
		}).catch(next);
	};
}