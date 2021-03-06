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
	app.engine('ejs', function () {
		console.log(arguments)
		return require('ejs').__express(...arguments);
	});
app.set('views', __dirname + '/public/pages');
app.set('view engine', 'ejs');

	// setup express
	app.use(nocache());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());




	// token middlewares

	app.use(jwt({
		credentialsRequired: false,
		secret: new Buffer('secret').toString('base64'),
		getToken: req => req.cookies.token || null
	}), function (req, res, next) {
		console.log(req.path, !req.user, req.user)
		if (req.path === '/user' && !req.user) {
			next(new Error('woops'));
		}
		next();
	});

	//set session for captcha
	app.use(["/auth/captcha.jpg","/auth/register"], session({
		// Change the secret if your use this app in prod !
		secret: "azertylol",
		resave: "false",
		saveUninitialized: "false",
		cookie: {
			maxAge: 420000
		}
	}));


	/* ROUTES */

	// login route
	app.post('/auth/login', wrapAsync(function* (req, res, next) {
		const account = yield Accounts.connect(req.body);
		res.cookie('token', account.token).redirect('/user');
	}));

	//register route
	app.post('/auth/register', captchaMiddleware, wrapAsync(function* (req, res, next) {
		yield Accounts.create({
			name: req.body.name,
			pwd: req.body.pwd,
			crontime: req.body.crontime
		});
		res.redirect('/auth/login');
	}));

	// captcha generator route
	app.get('/auth/captcha.jpg', function (req, res){
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

	// logout route
	app.post('/logout', function(req, res){
		res.clearCookie('token').redirect('/auth/login');
	});

	//JWT admin to access it
	app.get('/get/allusers', wrapAsync(function* (req, res, next) {
		res.json(yield Accounts.getAll());
	}));


	// distribute public directory ("path/to/file.html" => /path/to/file route)
	app.use(express.static(path.join(__dirname, 'public/'),{index:false,extensions:['css', 'js']}));

	app.get('/*', wrapAsync(function* (req, res, next) {
		res.render(req.path.slice(1), {user: req.user});
	}));

	// error and redirection middleware
	tokenRedirection.unless = unless;
	app.use(tokenRedirection);

	app.use(function (err, req, res, next) {
		console.log("ERROR TAVYU: ", err)
		if (401 == err.status) {
			next();
		}
		console.log(err)
		res.status(404).json(err);
	});

	// launch server
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

function captchaMiddleware(req, res, next) {
	if (!("captchaText" in req.session)){
		throw new Error("captcha out")
	}
	if (req.session.captchaText !== req.body.captcha){
		throw new Error("GFY§§")
	}
	next();
}

function tokenRedirection(err, req, res, next) {
    if(401 == err.status) {
    	if (req.originalUrl.split('/')[1] === 'auth') {
    		next();
    	} else {
	        res.redirect('/auth/login')
	    }
    } else {
    	next();
    }
}