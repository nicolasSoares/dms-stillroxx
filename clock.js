const CronJob = require('cron').CronJob;
const bot = require('./worker.js');

var job = new CronJob({
  cronTime: "13 6,7,8,9,10,11 * * *", // everyday, 9:13, 11:13, 4:13, 8:13,
  onTick: bot.testcron,
  start: true,
  timeZone: "America/Los_Angeles"
});

job.start();