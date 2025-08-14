const fs = require('fs');
const path = require('path');

class Config {
  constructor() {
    this.loadConfig();
    this.validateConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../../config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('config.json not found. Please create one based on config.example.json');
      }
      
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      this.partner = config.partner;
      this.link = config.link;
      this.idvc = config.idvc;
      
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  validateConfig() {
    const requiredFields = ['partner', 'link', 'idvc'];
    const missingFields = [];

    for (const field of requiredFields) {
      if (!this[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }

    // Validate Discord IDs (should be strings of digits)
    if (!/^\d+$/.test(this.partner)) {
      throw new Error('partner must be a valid Discord channel ID');
    }

    if (!/^\d+$/.test(this.idvc)) {
      throw new Error('idvc must be a valid Discord voice channel ID');
    }

    // Validate link format
    if (!this.link.startsWith('http')) {
      throw new Error('link must be a valid URL');
    }
  }

  get() {
    return {
      partner: this.partner,
      link: this.link,
      idvc: this.idvc
    };
  }
}

module.exports = new Config();