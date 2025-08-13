module.exports = {
  apps: [{
    name: 'discord-bot',
    script: 'bot.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DISCORD_TOKEN: process.env.DISCORD_TOKEN
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }, {
    name: 'discord-xp-bot',
    script: 'python3',
    args: 'discord_xp_bot.py',
    interpreter: 'none',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      DISCORD_TOKEN: process.env.DISCORD_TOKEN,
      PYTHONUNBUFFERED: '1'
    },
    error_file: './logs/xp-bot-err.log',
    out_file: './logs/xp-bot-out.log',
    log_file: './logs/xp-bot-combined.log',
    time: true
  }]
};