const CronJob = require('cron').CronJob;
const bot = require('./worker.js');

var job = new CronJob({
  cronTime: "00 * * * * *", // everyday, 9:13, 11:13, 4:13, 8:13,
  onTick: bot.testcron,
  start: true,
  timeZone: "America/Los_Angeles"
});
