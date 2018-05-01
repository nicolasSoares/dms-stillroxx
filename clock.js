const CronJob = require('cron').CronJob;
const bot = require('./worker.js');
const co = require('co');
const db = require('./db.js').init();

co(function*() {
	const crons = yield db.getCrons();
	crons.forEach(cron => {
		new cronJob({
			cronTime: cron.crontime,
			context: {name: cron.name},
			ontTick: bot.testcron,
			start: true,
			timeZone: "America/Los_Angeles"
		});
	});
});