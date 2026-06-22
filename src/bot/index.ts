import { Telegraf } from 'telegraf';
import type { BotContext } from '../types/context.js';
import { config } from '../config/index.js';
import { BOT_COMMANDS } from '../constants/index.js';
import { sessionMiddleware, userMiddleware } from './middleware/index.js';
import { registerStartHandler } from './handlers/start.handler.js';
import { registerProfileHandler, registerStatsHandler, registerHelpHandler } from './handlers/profile.handler.js';
import { registerTaskHandler } from './handlers/task.handler.js';
import { registerPartyHandler } from './handlers/party.handler.js';
import { registerDuelHandler } from './handlers/duel.handler.js';
import { registerLeaderboardHandler } from './handlers/leaderboard.handler.js';
import { registerInventoryHandler } from './handlers/inventory.handler.js';
import { registerSettingsHandler, registerNavHandler } from './handlers/settings.handler.js';
import { registerInlineHandler } from './handlers/inline.handler.js';
import { t, toI18nLang } from '../i18n/index.js';
import { duelResponseKeyboard } from '../ui/keyboards.js';

let telegramApi: Telegraf<BotContext>['telegram'] | null = null;

export function getTelegram() {
  if (!telegramApi) throw new Error('Bot not initialized');
  return telegramApi;
}

export async function notifyUser(
  telegramId: bigint | number,
  message: string,
  options?: {
    lang?: string;
    duelId?: string;
    parseMode?: 'HTML' | 'Markdown';
  },
) {
  const tg = getTelegram();
  const lang = toI18nLang(options?.lang ?? 'EN');

  const extra: Record<string, unknown> = {
    parse_mode: options?.parseMode ?? 'HTML',
  };

  if (options?.duelId) {
    Object.assign(extra, duelResponseKeyboard(options.duelId, lang));
  }

  await tg.sendMessage(Number(telegramId), message, extra);
}

export function createBot(): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(config.botToken);

  bot.use(sessionMiddleware);
  bot.use(userMiddleware);

  registerStartHandler(bot);
  registerProfileHandler(bot);
  registerStatsHandler(bot);
  registerHelpHandler(bot);
  registerTaskHandler(bot);
  registerPartyHandler(bot);
  registerDuelHandler(bot);
  registerLeaderboardHandler(bot);
  registerInventoryHandler(bot);
  registerSettingsHandler(bot);
  registerNavHandler(bot);
  registerInlineHandler(bot);

  bot.catch((err, ctx) => {
    console.error('[Bot Error]', err);
    ctx.reply(t('error.generic', ctx.lang ?? 'en')).catch(() => {});
  });

  telegramApi = bot.telegram;
  return bot;
}

export async function setupBotCommands(bot: Telegraf<BotContext>) {
  await bot.telegram.setMyCommands(BOT_COMMANDS);
}
