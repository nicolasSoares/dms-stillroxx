'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const unless = require('express-unless');
const jwt = require('express-jwt');
const co = require('co');
const path = require('path');
const svgCaptcha = require('svg-captcha');
const nocache = require('nocache');

const mongoClient = require("mongodb").MongoClient
const app = express();

const port = process.env.PORT || 3003;


co(function* () {
	//Connect to DB
	const Accounts = yield require('./db')();

	/* MIDDLEWARES */

	// setup express
	app.use(nocache());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());

	// token middlewares
	app.use(jwt({
		secret: new Buffer('secret').toString('base64'),
		getToken: req => req.cookies.token || null
	}).unless({path: [{url: /\/auth/i}]}));

	app.use('/auth/*', jwt({
		credentialsRequired: false,
		secret: new Buffer('secret').toString('base64'),
		getToken: req => req.cookies.token || null
	}), function (req, res, next) {
		if (req.user) res.redirect('/test');
		else next();
	});

	// error and redirection middleware
	tokenRedirection.unless = unless;
	app.use(tokenRedirection);

	app.use(function (err, req, res, next) {
		if (401 == err.status) {
			next();
		}
		console.log(err)
		res.status(404).json(err);
	});

	//set session for captcha
	app.use(["/captcha.jpg","/auth/register"], session({
		secret: "azertylol",
		resave: "false",
		saveUninitialized: "false",
		cookie: {
			maxAge: 420000
		}
	}));

	// distribute public directory ("path/to/file.html" => /path/to/file route)
	app.use(express.static(path.join(__dirname, 'public'),{index:false,extensions:['html']}));

	/* ROUTES */

	// login route
	app.post('/auth/login', wrapAsync(function* (req, res, next) {
		const account = yield Accounts.connect(req.body);
		res.cookie('token', account.token).redirect('/test');
	}));

	//register route
	app.post('/auth/register', wrapAsync(function* (req, res, next) {
		yield Accounts.create({
			name: req.body.name,
			pwd: req.body.pwd
		});
		res.json('created');
	}));

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

	app.post('/logout', function(req, res){
		res.clearCookie('token').redirect('/auth/login');
	});

	// launch server
	app.listen(port, _ => console.log('App is listening on port ', port));

	//JWT admin to access it
	app.get('/get/allusers', function (req, res) {
		res.json(t);
	});

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

function tokenRedirection(err, req, res, next) {
    if(401 == err.status) {
    	console.log(req.url, req.url.split('/')[1]);
    	if (req.originalUrl.split('/')[1] === 'auth') {
    		next();
    	} else {
	        res.redirect('/auth/login')
	    }
    } else {
    	next();
    }
}