const t = [
	{
		mail: "byers@langly.fr",
		pwd: "noob1234",
	},
	{
		mail: "langly@langly.fr",
		pwd: "titi1234",
	}
]

const express = require('express');
const app = express('express')();
const co = require('co');
//const bodyParser = require('body-parser');


co(function* () {
  //app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  //app.post('/signin', function (req, res) {
   //   res.render('./form/signin.html', { name: req.body.name });
  //});

  /*
    app.post('/signup', function (req, res) {
      res.render('', { name: x});
  }
  */

  app.listen(process.env.PORT || 3000, _ => console.log('App is listening !'));

}).catch(err => {
	console.error(err);
});
