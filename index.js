const app = require('express')();
const co = require('co');
const mongoClient = require("mongodb").MongoClient
const port = process.env.PORT || 3002;

co(function* () {
	const db = (yield mongoClient.connect(process.env.MONGOLAB_URI)).db();

  app.get('/', wrapAsync(function* (req, res, next) {
  	const totos = yield db.collection('toto').find().toArray();
    res.send("hello there" + totos);
  }));

  app.listen(port, _ => console.log('App is listening !'));
  
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