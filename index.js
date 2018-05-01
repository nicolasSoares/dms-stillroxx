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
const cookieParser = require('cookie-parser');
const unless = require('express-unless');
const jwt = require('express-jwt');
const app = express();
const co = require('co');
const mongoClient = require("mongodb").MongoClient
const port = process.env.PORT || 3003;
const path = require('path');
const svgCaptcha = require('svg-captcha');
const nocache = require('nocache');

co(function* () {
	const Accounts = yield require('./db')();
	
	app.use(nocache());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());

	app.use(jwt({
		secret: new Buffer('secret').toString('base64'),
		getToken: req => req.cookies.token || null
	}).unless({path: [{url: /\/auth/i}]}));

	app.use('/auth/*', jwt({
		credentialsRequired: false,
		secret: new Buffer('secret').toString('base64'),
		getToken: req => req.cookies.token || null
	}), function (req, res, next) {
		if (req.user)
			res.redirect('/test');
		else
			next();
	});

	tokenRedirection.unless = unless;
	app.use(tokenRedirection);

	app.use(express.static(path.join(__dirname, 'public'),{index:false,extensions:['html']}));

/*	app.get('/test', wrapAsync(function* (req, res, next) {
		yield Accounts.update({name: "marc"}, {a:1,r:45,g:true});
		res.send('hey');
	}));
*/

	// Sign In form

/*	app.get('/auth/login', (req, res) => {
		res.sendFile(path.join(__dirname + '/form/login.html'));
	});
*/
	app.post('/auth/login', wrapAsync(function* (req, res, next) {
		const account = yield Accounts.connect(req.body);
		res.cookie('token', account.token).redirect('/test');
	}));

	//Sign Up form

/*	app.get('/auth/register', function (req, res) {
		res.sendFile(path.join(__dirname + '/form/register.html'));
	});  
*/  

	app.post('/auth/register', wrapAsync(function* (req, res, next) {
		yield Accounts.create({
			name: req.body.name,
			pwd: req.body.pwd
		});

/*		var captcha = svgCaptcha.create();
	//  req.session.captcha = captcha.text;
	    res.type('svg');
	    res.status(200).send(captcha.data);		
*/
//		res.end(`<p>CAPTCHA VALID: ${ captcha.check(req, req.body[captchaFieldName]) }</p>`)
	res.json('created');
	}));

	app.use(function (err, req, res, next) {
		if (401 == err.status) {
			next();
		}
		console.log(err)
		res.status(404).json(err);
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