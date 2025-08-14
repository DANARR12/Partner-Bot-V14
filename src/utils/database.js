const db = require('multiple.db');
const logger = require('./logger');

class Database {
  constructor() {
    this.init();
  }

  init() {
    try {
      db.useJSON();
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      return await db.get(key);
    } catch (error) {
      logger.error(`Failed to get data for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await db.set(key, value);
      logger.debug(`Set data for key ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set data for key ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      await db.delete(key);
      logger.debug(`Deleted data for key ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete data for key ${key}:`, error);
      return false;
    }
  }

  async has(key) {
    try {
      return await db.has(key);
    } catch (error) {
      logger.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }

  async all() {
    try {
      return await db.all();
    } catch (error) {
      logger.error('Failed to get all data:', error);
      return [];
    }
  }
}

module.exports = new Database();