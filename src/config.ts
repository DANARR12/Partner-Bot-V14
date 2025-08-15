import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  discord: z.object({
    token: z.string().min(1, 'Discord token is required'),
    appId: z.string().min(1, 'App ID is required'),
    publicKey: z.string().optional(),
  }),
  redis: z.object({
    url: z.string().optional(),
  }),
  antiRaid: z.object({
    memberJoinThreshold: z.number().default(10),
    memberJoinTimeWindow: z.number().default(10000), // 10 seconds
    messageSpamThreshold: z.number().default(5),
    messageSpamTimeWindow: z.number().default(5000), // 5 seconds
    accountAgeThreshold: z.number().default(7 * 24 * 60 * 60 * 1000), // 7 days
  }),
});

const config = configSchema.parse({
  discord: {
    token: process.env.DISCORD_TOKEN,
    appId: process.env.APP_ID,
    publicKey: process.env.PUBLIC_KEY,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  antiRaid: {
    memberJoinThreshold: 10,
    memberJoinTimeWindow: 10000,
    messageSpamThreshold: 5,
    messageSpamTimeWindow: 5000,
    accountAgeThreshold: 7 * 24 * 60 * 60 * 1000,
  },
});

export { config };