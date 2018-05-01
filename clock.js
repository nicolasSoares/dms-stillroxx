const CronJob = require('cron').CronJob;
const bot = require('./worker.js');
const co = require('co');
const _ = require('underscore-node');

const loadedCrons = [];
function loadCrons() {
	co(function*() {
		const db = yield require('./db.js')();
		const crons = (yield db.getCrons()).filter(cron => _.isUndefined(_.findWhere(loadedCrons, {name: cron.name})));
		crons.forEach(cron => {
			loadedCrons.push(cron);
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
}

var	job = new CronJob({
  cronTime: '00 * * * * *',
  onTick: loadCrons,
  start: true,
  timeZone: "America/Los_Angeles"
});

loadCrons();


