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

co(function* () {
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use('/signin', express.static('form'))
  app.listen(process.env.PORT, _ => console.log('App is listening !'));

}).catch(err => {
	console.error(err);
});
