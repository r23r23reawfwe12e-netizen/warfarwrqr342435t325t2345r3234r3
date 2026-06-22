<<<<<<< HEAD
import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  botToken: requireEnv('BOT_TOKEN'),
  botUsername: process.env.BOT_USERNAME ?? 'SelfQuestBot',
  databaseUrl: requireEnv('DATABASE_URL'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  currentSeasonNumber: parseInt(process.env.CURRENT_SEASON_NUMBER ?? '1', 10),
  isDev: process.env.NODE_ENV !== 'production',
};
=======
import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  botToken: requireEnv('BOT_TOKEN'),
  botUsername: process.env.BOT_USERNAME ?? 'SelfQuestBot',
  databaseUrl: requireEnv('DATABASE_URL'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  currentSeasonNumber: parseInt(process.env.CURRENT_SEASON_NUMBER ?? '1', 10),
  isDev: process.env.NODE_ENV !== 'production',
};
>>>>>>> 3fa0ac1 (upload project)
