import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { getLeaderboard } from '../../services/leaderboard.service.js';
import { formatLeaderboard } from '../../ui/formatters.js';
import { leaderboardKeyboard } from '../../ui/keyboards.js';
import { requireUser } from '../middleware/index.js';
import type { LeaderboardPeriod } from '@prisma/client';

type Category = 'level' | 'xp' | 'elo' | 'streak';

const PERIOD_MAP: Record<string, LeaderboardPeriod> = {
  global: 'GLOBAL',
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  seasonal: 'SEASONAL',
};

export function registerLeaderboardHandler(bot: Telegraf<BotContext>) {
  bot.command('leaderboard', requireUser, async (ctx) => {
    await showLeaderboard(ctx, 'global', 'xp');
  });

  bot.action(/^lb:(\w+):(\w+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const period = ctx.match[1];
    const category = ctx.match[2] as Category;
    await showLeaderboard(ctx, period, category, true);
  });
}

async function showLeaderboard(
  ctx: BotContext,
  period: string,
  category: Category,
  edit = false,
) {
  const dbPeriod = PERIOD_MAP[period] ?? 'GLOBAL';
  const entries = await getLeaderboard(dbPeriod, category);
  const text = formatLeaderboard(entries, period, category, ctx.lang);
  const keyboard = leaderboardKeyboard(ctx.lang, period, category);

  if (edit && ctx.callbackQuery) {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
  } else {
    await ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  }
}
