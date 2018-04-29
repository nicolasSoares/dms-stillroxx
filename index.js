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

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const co = require('co');
const mongoClient = require("mongodb").MongoClient
const port = process.env.PORT || 3002;
const path = require('path');

co(function* () {
	const db = (yield mongoClient.connect(process.env.MONGOLAB_URI)).db();
  app.use(bodyParser.urlencoded({ extended: true }));  
  app.get('/test', wrapAsync(function* (req, res, next) {  	
//  	yield db.collection('accounts').insert(t[1]);
 	const d = yield db.collection('accounts').find().toArray();
 	console.log(d);
/*	const d = yield db.collection('accounts').updateOne(
		{ mail: "langly@langly.fr" },
		{ $set: {actif: true} }
	);
*/
	const g = (yield db.collection('accounts').findOne({actif: "x"})) || function () {throw Error('ARGG')}();
	console.log(g);
	res.send('hey');
  }));

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.get('/signin', function (req, res) {
    res.sendFile(path.join(__dirname + '/form/index.html'));
  });  
  
/*
  app.post('/signin', function (req, res) {
    res.render('./form/signin.html', { name: req.body.name });
  });  
 */   
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
