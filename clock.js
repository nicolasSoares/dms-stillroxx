const CronJob = require('cron').CronJob;
const bot = require('./worker.js');
const co = require('co');
co(function*() {
	const db = yield require('./db.js')();
	const crons = yield db.getCrons();
	crons.forEach(cron => {
		console.log('create cron: ', cron.crontime, cron.name);
		var	job = new CronJob({
		  cronTime: cron.crontime,
		  context: {name: cron.name},
		  onTick: bot.testcron,
		  start: true,
		  timeZone: "America/Los_Angeles"
		});
	});
});

