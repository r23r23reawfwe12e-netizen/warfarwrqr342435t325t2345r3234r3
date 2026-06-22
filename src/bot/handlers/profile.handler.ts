<<<<<<< HEAD
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import { formatProfileCard, formatStats } from '../../ui/formatters.js';
import { getCompletedTaskCount, getDuelStats } from '../../services/user.service.js';
import { getUserAchievements } from '../../services/achievement.service.js';
import { requireUser } from '../middleware/index.js';

export function registerProfileHandler(bot: Telegraf<BotContext>) {
  bot.command('profile', requireUser, async (ctx) => {
    const user = ctx.dbUser!;
    await ctx.reply(formatProfileCard(user, ctx.lang), { parse_mode: 'HTML' });
  });
}

export function registerStatsHandler(bot: Telegraf<BotContext>) {
  bot.command('stats', requireUser, async (ctx) => {
    const user = ctx.dbUser!;
    const [tasksCompleted, duelStats, achievements] = await Promise.all([
      getCompletedTaskCount(user.id),
      getDuelStats(user.id),
      getUserAchievements(user.id),
    ]);

    await ctx.reply(
      formatStats(
        user,
        {
          tasksCompleted,
          duelsWon: duelStats.won,
          duelsLost: duelStats.lost,
          achievementCount: achievements.length,
        },
        ctx.lang,
      ),
      { parse_mode: 'HTML' },
    );
  });
}

export function registerHelpHandler(bot: Telegraf<BotContext>) {
  bot.command('help', async (ctx) => {
    const lang = ctx.lang;
    const { config } = await import('../../config/index.js');
    await ctx.reply(
      `${t('help.title', lang)}\n\n${t('help.commands', lang)}\n\n${t('help.tip', lang, { bot: config.botUsername })}`,
      { parse_mode: 'HTML' },
    );
  });
}
=======
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import { formatProfileCard, formatStats } from '../../ui/formatters.js';
import { getCompletedTaskCount, getDuelStats } from '../../services/user.service.js';
import { getUserAchievements } from '../../services/achievement.service.js';
import { requireUser } from '../middleware/index.js';

export function registerProfileHandler(bot: Telegraf<BotContext>) {
  bot.command('profile', requireUser, async (ctx) => {
    const user = ctx.dbUser!;
    await ctx.reply(formatProfileCard(user, ctx.lang), { parse_mode: 'HTML' });
  });
}

export function registerStatsHandler(bot: Telegraf<BotContext>) {
  bot.command('stats', requireUser, async (ctx) => {
    const user = ctx.dbUser!;
    const [tasksCompleted, duelStats, achievements] = await Promise.all([
      getCompletedTaskCount(user.id),
      getDuelStats(user.id),
      getUserAchievements(user.id),
    ]);

    await ctx.reply(
      formatStats(
        user,
        {
          tasksCompleted,
          duelsWon: duelStats.won,
          duelsLost: duelStats.lost,
          achievementCount: achievements.length,
        },
        ctx.lang,
      ),
      { parse_mode: 'HTML' },
    );
  });
}

export function registerHelpHandler(bot: Telegraf<BotContext>) {
  bot.command('help', async (ctx) => {
    const lang = ctx.lang;
    const { config } = await import('../../config/index.js');
    await ctx.reply(
      `${t('help.title', lang)}\n\n${t('help.commands', lang)}\n\n${t('help.tip', lang, { bot: config.botUsername })}`,
      { parse_mode: 'HTML' },
    );
  });
}
>>>>>>> 3fa0ac1 (upload project)
