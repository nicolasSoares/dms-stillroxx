const CronJob = require('cron').CronJob;
const bot = require('./worker.js');
const co = require('co');
co(function*() {
	const db = yield require('./db.js')();
	const crons = yield db.getCrons();
	crons.forEach(cron => {
		console.log(cron);
		var	job = new CronJob({
		  cronTime: "00 * * * * *",
		  context: {name:'jeje'},
		  onTick: bot.testcron,
		  start: true,
		  timeZone: "America/Los_Angeles"
		});
	});
});

