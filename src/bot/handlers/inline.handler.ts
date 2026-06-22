import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import { findUserByTelegramId } from '../../services/user.service.js';
import { formatProfileCard } from '../../ui/formatters.js';
import { getLeaderboard } from '../../services/leaderboard.service.js';
import { formatLeaderboard } from '../../ui/formatters.js';
import { getPartyInfo } from '../../services/party.service.js';
import { formatPartyInfo } from '../../ui/formatters.js';
import { toI18nLang } from '../../i18n/index.js';
import { config } from '../../config/index.js';

export function registerInlineHandler(bot: Telegraf<BotContext>) {
  bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query.trim().toLowerCase();
    const telegramId = ctx.from.id;
    const user = await findUserByTelegramId(telegramId);
    const lang = user ? toI18nLang(user.language) : 'en';

    const results = [];

    if (!query || query.includes('profile')) {
      if (user) {
        results.push({
          type: 'article' as const,
          id: 'profile',
          title: t('inline.profile', lang),
          description: user.displayName,
          input_message_content: {
            message_text: formatProfileCard(user, lang),
            parse_mode: 'HTML' as const,
          },
        });
      }
    }

    if (!query || query.includes('task')) {
      results.push({
        type: 'article' as const,
        id: 'task',
        title: t('inline.task', lang),
        description: 'Create a task',
        input_message_content: {
          message_text: `📋 ${t('task.menu.title', lang)}\n\n/task`,
          parse_mode: 'HTML' as const,
        },
      });
    }

    if (!query || query.includes('duel')) {
      results.push({
        type: 'article' as const,
        id: 'duel',
        title: t('inline.duel', lang),
        description: '/duel @username',
        input_message_content: {
          message_text: `⚔️ ${t('duel.menu.title', lang)}\n\n/duel @username`,
          parse_mode: 'HTML' as const,
        },
      });
    }

    if (!query || query.includes('party')) {
      if (user) {
        const info = await getPartyInfo(user.id);
        if (info) {
          const deepLink = `https://t.me/${config.botUsername}?start=party_${info.party.partyCode}`;
          results.push({
            type: 'article' as const,
            id: 'party',
            title: t('inline.party', lang),
            description: info.party.name,
            input_message_content: {
              message_text: formatPartyInfo(info.party, info.bonus, info.bonusActive, lang),
              parse_mode: 'HTML' as const,
            },
            reply_markup: {
              inline_keyboard: [[{ text: t('button.join', lang), url: deepLink }]],
            },
          });
        }
      }
    }

    if (!query || query.includes('leaderboard') || query.includes('lb')) {
      const entries = await getLeaderboard('GLOBAL', 'xp', 5);
      results.push({
        type: 'article' as const,
        id: 'leaderboard',
        title: t('inline.leaderboard', lang),
        description: 'Top players',
        input_message_content: {
          message_text: formatLeaderboard(entries, 'global', 'xp', lang),
          parse_mode: 'HTML' as const,
        },
      });
    }

    await ctx.answerInlineQuery(results.slice(0, 50), { cache_time: 30 });
  });
}
