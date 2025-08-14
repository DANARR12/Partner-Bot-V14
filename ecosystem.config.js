module.exports = {
  apps: [
    {
      name: 'discord-partner-bot',
      script: 'src/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      },
      env_development: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug'
      },
      // Advanced PM2 features
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      monitoring: false,
      pmx: false,
      
      // Process behavior
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true,
      
      // Auto-restart on file changes (disable in production)
      ignore_watch: [
        'node_modules',
        'logs',
        'data.json',
        '.git'
      ]
    },
    {
      name: 'discord-partner-bot-legacy',
      script: 'bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      },
      // Same configuration as above
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      log_file: './logs/legacy-combined.log',
      out_file: './logs/legacy-out.log',
      error_file: './logs/legacy-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true
    }
  ]
};