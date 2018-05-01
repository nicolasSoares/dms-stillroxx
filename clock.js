const CronJob = require('cron').CronJob;
const bot = require('./worker.js');
const co = require('co');
/*co(function*() {
	const db = yield require('./db.js')();
	const crons = yield db.getCrons();
	crons.forEach(cron => {
		console.log(cron);
		new CronJob({
			cronTime: '12 * * * * *',
			context: {name: 'mange'},
			ontTick: bot.testcron,
			start: true,
			timeZone: "America/Los_Angeles"
		});
	});
});
*/
	var	job = new CronJob({
			cronTime: '* * * * * *',
			ontTick: bot.testcron,
			start: true,
			timeZone: "America/Los_Angeles"
		});
