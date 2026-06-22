import type { MiddlewareFn } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { findUserByTelegramId } from '../../services/user.service.js';
import { toI18nLang } from '../../i18n/index.js';

const sessions = new Map<number, BotContext['session']>();

export function getSession(telegramId: number): BotContext['session'] {
  if (!sessions.has(telegramId)) {
    sessions.set(telegramId, {});
  }
  return sessions.get(telegramId)!;
}

export const sessionMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (telegramId) {
    ctx.session = getSession(telegramId);
  } else {
    ctx.session = {};
  }
  await next();
};

export const userMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (telegramId) {
    const user = await findUserByTelegramId(telegramId);
    if (user) {
      ctx.dbUser = user;
      ctx.lang = toI18nLang(user.language);
    } else {
      ctx.lang = 'en';
    }
  } else {
    ctx.lang = 'en';
  }
  await next();
};

export const requireUser: MiddlewareFn<BotContext> = async (ctx, next) => {
  if (!ctx.dbUser) {
    await ctx.reply(ctx.lang === 'en' ? 'Please /start first.' : 'Сначала /start.');
    return;
  }
  if (!ctx.dbUser.onboardingDone) {
    await ctx.reply('Please complete onboarding with /start');
    return;
  }
  await next();
};
