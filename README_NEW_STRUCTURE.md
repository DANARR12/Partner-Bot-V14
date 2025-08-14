# Discord Partner Bot - New Modular Structure

This is an improved version of the Discord partner bot with better organization, error handling, and maintainability.

## 🏗️ Project Structure

```
src/
├── bot.js              # Main entry point
├── config/
│   └── config.js       # Configuration management with validation
├── events/
│   ├── ready.js        # Bot ready event handler
│   ├── messageCreate.js # Message event handlers
│   └── voiceReady.js   # Voice channel connection handler
└── utils/
    ├── database.js     # Database wrapper with error handling
    └── logger.js       # Advanced logging utility
```

## 🚀 Features

### Improved Error Handling
- Comprehensive error catching and logging
- Graceful fallbacks for failed operations
- Better user feedback for errors

### Modular Architecture
- Separated concerns into different modules
- Easy to maintain and extend
- Clear separation of events and utilities

### Enhanced Logging
- Color-coded console output
- File logging with timestamps
- Configurable log levels (debug, info, warn, error)

### Configuration Validation
- Validates all required configuration fields
- Checks Discord ID formats
- Ensures URLs are properly formatted

### Better Database Management
- Wrapped database operations with error handling
- Debug logging for database operations
- Fallback values for failed operations

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Discord bot token
   ```

3. **Configure Bot Settings**
   ```bash
   cp config.example.json config.json
   # Edit config.json with your channel IDs and invite link
   ```

4. **Validate Configuration**
   ```bash
   npm run validate-config
   ```

## 🎮 Usage

### Production
```bash
npm start
```

### Development
```bash
npm run dev
```

### Debug Mode
```bash
npm run dev:debug
```

### Legacy Mode (Old Structure)
```bash
npm run start:legacy
```

## 📝 Configuration

The `config.json` file should contain:

```json
{
  "partner": "PARTNER_CHANNEL_ID",
  "link": "YOUR_DISCORD_INVITE_LINK", 
  "idvc": "VOICE_CHANNEL_ID"
}
```

## 🔍 Logging

### Log Levels
- `debug`: Detailed information for debugging
- `info`: General information (default)
- `warn`: Warning messages
- `error`: Error messages

### Log Output
- Console: Color-coded messages
- File: `log.txt` with timestamps

### Environment Variables
```bash
LOG_LEVEL=debug  # Set log level (debug, info, warn, error)
```

## 🚨 Error Handling

The bot includes comprehensive error handling for:
- Discord API errors
- Database operation failures
- Invalid configuration
- Voice connection issues
- Invalid invite links

## 🔄 Migration from Old Structure

The old `bot.js` file is preserved for backward compatibility. You can:

1. **Use the new structure**: `npm start`
2. **Use the old structure**: `npm run start:legacy`

## 📚 Event Handlers

### Ready Event (`src/events/ready.js`)
- Sets bot activity
- Logs connection information
- Displays guild and user counts

### Message Events (`src/events/messageCreate.js`)
- **Ad Requests**: Handles "reklam" commands
- **Mentions**: Responds to bot mentions
- **DM Advertisements**: Processes server invites with cooldown

### Voice Events (`src/events/voiceReady.js`)
- Auto-joins configured voice channel
- Handles voice connection errors
- Logs voice state changes

## 🔧 Utilities

### Database (`src/utils/database.js`)
- Wrapped multiple.db operations
- Error handling for all database operations
- Debug logging

### Logger (`src/utils/logger.js`)
- Color-coded console output
- File logging with rotation
- Configurable log levels

### Config (`src/config/config.js`)
- Validates configuration on startup
- Checks required fields
- Validates Discord ID formats

## 🐛 Troubleshooting

### Configuration Issues
```bash
npm run validate-config
```

### Debug Mode
```bash
LOG_LEVEL=debug npm start
```

### Check Logs
```bash
tail -f log.txt
```

## 📈 Improvements Over Original

1. **Better Organization**: Modular file structure
2. **Error Handling**: Comprehensive error catching
3. **Logging**: Advanced logging with levels and colors
4. **Validation**: Configuration validation on startup
5. **Maintainability**: Separated concerns and clear structure
6. **Documentation**: Better code comments and documentation
7. **Graceful Shutdown**: Proper cleanup on exit
8. **Enhanced Features**: Better user feedback and error messages

## 🤝 Contributing

1. Use the modular structure in `src/`
2. Add proper error handling
3. Include logging for important events
4. Validate inputs and configuration
5. Follow the established patterns

## 📄 License

ISC License - See original project for details.