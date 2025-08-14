# Discord OAuth Setup Guide 🔐

Your Discord bot now includes **secure authentication** using Discord OAuth! Follow these steps to set it up.

## 🎯 Quick Setup

### 1. Create Discord Application OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to **OAuth2** section
4. Add redirect URI: `http://localhost:3000/auth/callback`
5. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables
Update your `.env` file with the OAuth credentials:

```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_actual_client_id_here
DISCORD_CLIENT_SECRET=your_actual_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Admin Configuration (Your Discord User ID)
BOT_OWNER_ID=your_discord_user_id_here
ADMIN_USERS=user_id_1,user_id_2,user_id_3
```

### 3. Start the Authenticated Bot
```bash
# Start with authentication
npm run start:auth

# Or start forever with PM2
npm run start:forever
```

## 🔧 Detailed Configuration

### Discord Application Setup

#### Step 1: OAuth2 Settings
1. **Discord Developer Portal** → Your Application → **OAuth2**
2. **Redirects**: Add `http://localhost:3000/auth/callback`
3. **Scopes**: The bot automatically requests `identify` and `guilds`

#### Step 2: Get Credentials
- **Client ID**: Found in OAuth2 → General
- **Client Secret**: Found in OAuth2 → General → Click "Reset Secret"

#### Step 3: Bot Permissions
Make sure your bot has the necessary permissions in your Discord server.

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_CLIENT_ID` | Your Discord application's Client ID | `123456789012345678` |
| `DISCORD_CLIENT_SECRET` | Your Discord application's Client Secret | `abcdef123456...` |
| `DISCORD_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/auth/callback` |
| `SESSION_SECRET` | Secret key for session encryption | `your-secret-key-123` |
| `BOT_OWNER_ID` | Your Discord User ID (for admin access) | `987654321098765432` |
| `ADMIN_USERS` | Comma-separated list of admin user IDs | `user1,user2,user3` |

### Getting Your Discord User ID
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click your username → Copy ID
3. Use this ID for `BOT_OWNER_ID`

## 🛡️ Security Features

### Authentication Flow
1. User visits dashboard → Redirected to Discord OAuth
2. User authorizes → Discord redirects back with code
3. Bot exchanges code for access token
4. Bot fetches user info and guild list
5. User is logged in and can access dashboard

### Access Control
- **Authentication Required**: All dashboard routes require login
- **Admin Only**: Dashboard access restricted to configured admins
- **Session Management**: 24-hour session timeout
- **Secure Sessions**: Encrypted session storage

### Admin Permissions
Users with dashboard access:
- Bot owner (BOT_OWNER_ID)
- Additional admins (ADMIN_USERS)
- Must be authenticated via Discord OAuth

## 🌐 Dashboard URLs

### Public URLs
- **Login**: http://localhost:3000/auth/login
- **OAuth Callback**: http://localhost:3000/auth/callback (automatic)
- **Logout**: http://localhost:3000/auth/logout

### Protected URLs (Admin Only)
- **Dashboard**: http://localhost:3000/
- **Bot Status API**: http://localhost:3000/api/status
- **Recent Ads API**: http://localhost:3000/api/recent-ads
- **User Info API**: http://localhost:3000/api/user

## 🚀 Starting the Bot

### Development Mode
```bash
npm run start:auth
```

### Production Mode (Forever)
```bash
npm run start:forever
```

### Using Bot Manager Script
```bash
./bot-manager.sh start
```

## 🔍 Testing the Setup

### 1. Check Configuration
```bash
# Test basic connectivity
./bot-manager.sh test

# Check if OAuth is configured
curl http://localhost:3000/auth/login
```

### 2. Test Authentication Flow
1. Visit: http://localhost:3000
2. Should redirect to Discord OAuth
3. Authorize the application
4. Should redirect back to dashboard
5. Check console for authentication log

### 3. Verify Admin Access
- Only configured admins should see the dashboard
- Non-admins should see "Access Denied"

## 🚨 Troubleshooting

### Common Issues

#### "Invalid Client" Error
- Check `DISCORD_CLIENT_ID` is correct
- Ensure Discord application exists

#### "Invalid Redirect URI" Error
- Verify redirect URI in Discord Developer Portal matches `.env`
- Check URL exactly: `http://localhost:3000/auth/callback`

#### "Access Denied" Error
- Check `BOT_OWNER_ID` matches your Discord User ID
- Verify `ADMIN_USERS` contains correct user IDs
- Enable Discord Developer Mode to copy user IDs

#### Session Issues
- Clear browser cookies
- Restart the bot
- Check `SESSION_SECRET` is set

### Debug Commands
```bash
# View bot logs
npm run logs

# Check bot status
npm run status

# Test API directly
curl -H "Cookie: session_id" http://localhost:3000/api/status
```

## 🔒 Security Best Practices

1. **Keep secrets secure**: Never commit `.env` file to git
2. **Use strong session secret**: Generate a random, long secret key
3. **Limit admin access**: Only add trusted users to `ADMIN_USERS`
4. **Monitor logs**: Check authentication logs regularly
5. **Update regularly**: Keep dependencies updated

## 🎉 Success!

Once configured, your dashboard will have:
- ✅ Secure Discord OAuth authentication
- ✅ Admin-only access control
- ✅ Session management
- ✅ User information display
- ✅ Protected API endpoints

Users must authenticate with Discord and be approved admins to access the dashboard!