const EventEmitter = require('events');
const chalk = require('chalk');

const logger = new EventEmitter();

logger.on('logging', (msg, color='blue') => {
    console.log(chalk[color](msg));
})

module.exports = logger;