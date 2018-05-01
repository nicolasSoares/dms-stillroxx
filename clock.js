const CronJob = require('cron').CronJob;
const bot = require('./worker.js');
const co = require('co');
co(function*() {
	const db = yield require('./db.js')();
	const crons = yield db.getCrons();
	crons.forEach(cron => {
		new CronJob({
			cronTime: cron.crontime,
			context: {name: cron.name},
			ontTick: bot.testcron,
			start: true,
			timeZone: "America/Los_Angeles"
		});
	});
});