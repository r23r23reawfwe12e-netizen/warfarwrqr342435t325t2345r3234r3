<<<<<<< HEAD
import { createBot, setupBotCommands } from './bot/index.js';
import { connectRedis } from './database/redis.js';
import { prisma } from './database/prisma.js';
import { initI18n } from './i18n/index.js';
import { expireOldTasks } from './services/task.service.js';
import { resolveExpiredDuels } from './services/duel.service.js';
import { resetDailyPartyActivity } from './services/party.service.js';
import { getActiveSeason, getSeasonDaysRemaining, endSeason } from './services/season.service.js';
import { config } from './config/index.js';

const HOUR_MS = 60 * 60 * 1000;

async function runScheduledJobs() {
  try {
    await expireOldTasks();
    await resolveExpiredDuels();

    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      await resetDailyPartyActivity();
    }

    const daysLeft = await getSeasonDaysRemaining();
    if (daysLeft <= 0) {
      await endSeason();
      console.log('[Season] Season ended and new season started');
    }
  } catch (err) {
    console.error('[Jobs] Error:', err);
  }
}

async function main() {
  console.log('⚡ SELFQUEST Bot starting...');
  console.log(`Environment: ${config.nodeEnv}`);

  await connectRedis();
  await initI18n();

  try {
    await prisma.$connect();
    console.log('[Database] Connected');
  } catch (err) {
    console.error('[Database] Failed to connect:', err);
    process.exit(1);
  }

  const season = await getActiveSeason();
  console.log(`[Season] Active: ${season.name} (${await getSeasonDaysRemaining()} days left)`);

  const bot = createBot();
  await setupBotCommands(bot);

  setInterval(runScheduledJobs, HOUR_MS);
  runScheduledJobs();

  bot.launch({
    dropPendingUpdates: true,
  });

  console.log(`✅ SELFQUEST is live (@${config.botUsername})`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
=======
import { createBot, setupBotCommands } from './bot/index.js';
import { connectRedis } from './database/redis.js';
import { prisma } from './database/prisma.js';
import { initI18n } from './i18n/index.js';
import { expireOldTasks } from './services/task.service.js';
import { resolveExpiredDuels } from './services/duel.service.js';
import { resetDailyPartyActivity } from './services/party.service.js';
import { getActiveSeason, getSeasonDaysRemaining, endSeason } from './services/season.service.js';
import { config } from './config/index.js';

const HOUR_MS = 60 * 60 * 1000;

async function runScheduledJobs() {
  try {
    await expireOldTasks();
    await resolveExpiredDuels();

    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      await resetDailyPartyActivity();
    }

    const daysLeft = await getSeasonDaysRemaining();
    if (daysLeft <= 0) {
      await endSeason();
      console.log('[Season] Season ended and new season started');
    }
  } catch (err) {
    console.error('[Jobs] Error:', err);
  }
}

async function main() {
  console.log('⚡ SELFQUEST Bot starting...');
  console.log(`Environment: ${config.nodeEnv}`);

  await connectRedis();
  await initI18n();

  try {
    await prisma.$connect();
    console.log('[Database] Connected');
  } catch (err) {
    console.error('[Database] Failed to connect:', err);
    process.exit(1);
  }

  const season = await getActiveSeason();
  console.log(`[Season] Active: ${season.name} (${await getSeasonDaysRemaining()} days left)`);

  const bot = createBot();
  await setupBotCommands(bot);

  setInterval(runScheduledJobs, HOUR_MS);
  runScheduledJobs();

  bot.launch({
    dropPendingUpdates: true,
  });

  console.log(`✅ SELFQUEST is live (@${config.botUsername})`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
>>>>>>> 3fa0ac1 (upload project)
