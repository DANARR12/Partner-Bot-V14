const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = path.join(__dirname, '../../log.txt');
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  formatMessage(level, message, ...args) {
    const timestamp = this.getTimestamp();
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}`.trim();
  }

  writeToFile(formattedMessage) {
    try {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, ...args) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, ...args);
    
    // Console output with colors
    switch (level) {
      case 'debug':
        console.debug('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan
        break;
      case 'info':
        console.info('\x1b[32m%s\x1b[0m', formattedMessage); // Green
        break;
      case 'warn':
        console.warn('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow
        break;
      case 'error':
        console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red
        break;
      default:
        console.log(formattedMessage);
    }

    // File output
    this.writeToFile(formattedMessage);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  error(message, ...args) {
    this.log('error', message, ...args);
  }
}

module.exports = new Logger();