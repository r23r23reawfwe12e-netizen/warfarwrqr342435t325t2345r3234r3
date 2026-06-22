import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t, toDbLang } from '../../i18n/index.js';
import { updateUserLanguage } from '../../services/user.service.js';
import { settingsKeyboard } from '../../ui/keyboards.js';
import { CALLBACK_PREFIX } from '../../constants/index.js';
import { requireUser } from '../middleware/index.js';

export function registerSettingsHandler(bot: Telegraf<BotContext>) {
  bot.command('settings', requireUser, async (ctx) => {
    await ctx.reply(t('settings.title', ctx.lang), {
      ...settingsKeyboard(ctx.lang),
    });
  });

  bot.action(/^settings:lang:(en|ru|ua)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const lang = ctx.match[1] as 'en' | 'ru' | 'ua';
    await updateUserLanguage(ctx.dbUser!.id, toDbLang(lang));
    ctx.lang = lang;
    await ctx.editMessageText(t('settings.updated', lang), {
      ...settingsKeyboard(lang),
    });
  });
}

export function registerNavHandler(bot: Telegraf<BotContext>) {
  bot.action(`${CALLBACK_PREFIX.NAV}main`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const { mainMenuKeyboard } = await import('../../ui/keyboards.js');
    await ctx.editMessageText('⚡ SELFQUEST', mainMenuKeyboard(ctx.lang));
  });

  bot.action(`${CALLBACK_PREFIX.NAV}task`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const { taskMenuKeyboard } = await import('../../ui/keyboards.js');
    await ctx.editMessageText(t('task.menu.title', ctx.lang), taskMenuKeyboard(ctx.lang));
  });

  bot.action(`${CALLBACK_PREFIX.NAV}party`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const { getPartyInfo } = await import('../../services/party.service.js');
    const { partyMenuKeyboard } = await import('../../ui/keyboards.js');
    const info = await getPartyInfo(ctx.dbUser!.id);
    await ctx.editMessageText(t('party.menu.title', ctx.lang), partyMenuKeyboard(ctx.lang, !!info));
  });

  bot.action(`${CALLBACK_PREFIX.NAV}duel`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const { duelMenuKeyboard } = await import('../../ui/keyboards.js');
    await ctx.editMessageText(t('duel.menu.title', ctx.lang), duelMenuKeyboard(ctx.lang));
  });

  bot.action(`${CALLBACK_PREFIX.NAV}lb`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const { getLeaderboard } = await import('../../services/leaderboard.service.js');
    const { formatLeaderboard } = await import('../../ui/formatters.js');
    const { leaderboardKeyboard } = await import('../../ui/keyboards.js');
    const entries = await getLeaderboard('GLOBAL', 'xp');
    await ctx.editMessageText(formatLeaderboard(entries, 'global', 'xp', ctx.lang), {
      parse_mode: 'HTML',
      ...leaderboardKeyboard(ctx.lang),
    });
  });
}
