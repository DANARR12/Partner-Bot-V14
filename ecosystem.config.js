module.exports = {
  apps: [
    {
      name: 'discord-ad-bot',
      script: 'src/bot-with-auth.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'discord-basic-bot',
      script: 'src/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: false,
      disabled: true, // Disabled by default, only dashboard version runs
      error_file: './logs/basic-err.log',
      out_file: './logs/basic-out.log',
      log_file: './logs/basic-combined.log',
      time: true
    }
  ]
};