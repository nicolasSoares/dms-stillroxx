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
	const Accounts = yield require('./db')();
	
	app.use(bodyParser.urlencoded({ extended: true }));  

	app.get('/test', wrapAsync(function* (req, res, next) {
		yield Accounts.update({name: "marc"}, {a:1,r:45,g:true});
		res.send('hey');
	}));

	app.get('/', wrapAsync(function* (req, res, next) {
		yield Accounts.create({name: "marc", pwd: "tet"});
		res.send('Hello World!');
	}));


	// Sign In form

	app.get('/signin', (req, res) => {
		res.sendFile(path.join(__dirname + '/form/signin.html'));
	});

	app.post('/signin', wrapAsync(function* (req, res, next) {
		const account = yield Accounts.connect(req.body);
		res.send("bienvenue: " + account.name);
	}));  

	//Sign Up form

	app.get('/signup', function (req, res) {
		res.sendFile(path.join(__dirname + '/form/signup.html'));
	});  
  
/*
	app.post('/signin', function (req, res) {
		
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

// *** Temporaire IS USER ? ***
function isUser(credential) {   
    return (credential.name == "toto");
}
