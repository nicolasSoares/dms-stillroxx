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
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const co = require('co');
const mongoClient = require("mongodb").MongoClient
const port = process.env.PORT || 3002;
const path = require('path');
const svgCaptcha = require('svg-captcha');


co(function* () {
	const Accounts = yield require('./db')();

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(["/captcha.jpg","/auth/register"], session({
		secret: "azertylol",
		resave: "false",
		saveUninitialized: "false",
		cookie: {
			maxAge: 20000
		}
	}));

	app.get('/test', wrapAsync(function* (req, res, next) {
		yield Accounts.update({name: "marc"}, {a:1,r:45,g:true});
		res.send('hey');
	}));

	app.get('/', wrapAsync(function* (req, res, next) {
		yield Accounts.create({name: "marc", pwd: "tet"});
		res.send('Hello World!');
	}));


	// Sign In form
	app.get('/auth/login', (req, res) => {
		res.sendFile(path.join(__dirname + '/form/login.html'));
	});

	app.post('/auth/login', wrapAsync(function* (req, res, next) {
		const account = yield Accounts.connect(req.body);
		res.send("bienvenue: " + account.name);
	}));

	//Sign Up form
	app.get('/auth/register', function (req, res) {
		res.sendFile(path.join(__dirname + '/form/register.html'));
	});


	app.post('/auth/register', function (req, res) {
		if (!("captchaText" in req.session)){
			throw new Error("captcha out")
		}
		if (req.session.captchaText === req.body.captcha){
			//adduser 
			res.send("hello")
		} else {
			throw new Error("GFY§§")
		}
	});


	app.get('/captcha.jpg', function (req, res){
		// Captcha
		var text = svgCaptcha.randomText();
		// generate svg image
		var captcha = svgCaptcha(text);
		// generate both and returns an object
		var captcha = svgCaptcha.create({size:5});
		req.session.captchaText = captcha.text

		res.type('svg');
		res.send(captcha.data);

	});


	//JWT admin to access it
	app.get('/get/allusers', function (req, res) {
		res.json(t);
	});


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
