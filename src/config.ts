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
});

export const AntiRaidConfig = {
  // Join burst control
  joinWindowMs: 60_000,
  joinThreshold: 10,           // if >10 joins in 60s -> lockdown triggers

  // New-account sensitivity
  minAccountAgeMs: 1000 * 60 * 60 * 24 * 3, // 3 days (newer accounts flagged)

  // Mention spam
  mentionWindowMs: 10_000,
  mentionThreshold: 8,         // 8 mentions in 10s => timeout

  // Link & invite
  linkWindowMs: 10_000,
  linkThreshold: 6,            // 6 links in 10s => escalate
  blockInvites: true,

  // Channel flood
  channelWindowMs: 10_000,
  channelMsgThreshold: 25,     // 25 msgs/10s across channels => lockdown

  // Webhook flood
  webhookWindowMs: 30_000,
  webhookMsgThreshold: 30,

  // Actions
  timeoutMinutes: 30,
  banOnExtreme: true,

  // Lockdown behavior
  lockdownDurationMs: 30 * 60_000, // 30 minutes
  lockdownRolesToClamp: ["@everyone"], // roles to deny Send Msg / Connect
};

export { config };