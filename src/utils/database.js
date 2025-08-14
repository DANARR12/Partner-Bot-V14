const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class Database {
  constructor() {
    this.dataFile = path.join(__dirname, '../../data.json');
    this.data = {};
    this.init();
  }

  init() {
    try {
      // Load existing data if file exists
      if (fs.existsSync(this.dataFile)) {
        const fileContent = fs.readFileSync(this.dataFile, 'utf8');
        this.data = JSON.parse(fileContent);
        logger.info('Database loaded successfully from data.json');
      } else {
        // Create empty data file
        this.data = {};
        this.save();
        logger.info('Database initialized with empty data.json');
      }
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      this.data = {};
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
      logger.debug('Database saved to data.json');
    } catch (error) {
      logger.error('Failed to save database:', error);
    }
  }

  async get(key) {
    try {
      const value = this.data[key];
      logger.debug(`Retrieved data for key ${key}: ${value}`);
      return value || null;
    } catch (error) {
      logger.error(`Failed to get data for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      this.data[key] = value;
      this.save();
      logger.debug(`Set data for key ${key}: ${value}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set data for key ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      delete this.data[key];
      this.save();
      logger.debug(`Deleted data for key ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete data for key ${key}:`, error);
      return false;
    }
  }

  async has(key) {
    try {
      const exists = key in this.data;
      logger.debug(`Key ${key} exists: ${exists}`);
      return exists;
    } catch (error) {
      logger.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }

  async all() {
    try {
      logger.debug('Retrieved all data');
      return { ...this.data };
    } catch (error) {
      logger.error('Failed to get all data:', error);
      return {};
    }
  }

  // Additional utility methods
  async clear() {
    try {
      this.data = {};
      this.save();
      logger.info('Database cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear database:', error);
      return false;
    }
  }

  async size() {
    try {
      return Object.keys(this.data).length;
    } catch (error) {
      logger.error('Failed to get database size:', error);
      return 0;
    }
  }

  async keys() {
    try {
      return Object.keys(this.data);
    } catch (error) {
      logger.error('Failed to get database keys:', error);
      return [];
    }
  }
}

module.exports = new Database();