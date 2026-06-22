<<<<<<< HEAD
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import {
  createDuel,
  respondToDuel,
  getActiveDuels,
} from '../../services/duel.service.js';
import { findUserByUsername } from '../../services/user.service.js';
import { duelMenuKeyboard,
  duelTypeKeyboard,
  duelDurationKeyboard,
  duelStakeKeyboard,
} from '../../ui/keyboards.js';
import { CALLBACK_PREFIX } from '../../constants/index.js';
import { parseDuelTarget } from '../../utils/helpers.js';
import { requireUser } from '../middleware/index.js';
import type { DuelStakeType, DuelType } from '@prisma/client';

export function registerDuelHandler(bot: Telegraf<BotContext>) {
  bot.command('duel', requireUser, async (ctx) => {
    const text = ctx.message.text;
    const target = parseDuelTarget(text);

    if (target) {
      const opponent = await findUserByUsername(target);
      if (!opponent) {
        await ctx.reply(t('duel.no_opponent', ctx.lang));
        return;
      }
      if (opponent.id === ctx.dbUser!.id) {
        await ctx.reply(t('duel.self', ctx.lang));
        return;
      }

      ctx.session.duelDraft = {
        opponentId: opponent.id,
        opponentUsername: target,
      };

      await ctx.reply(t('duel.select_type', ctx.lang), {
        ...duelTypeKeyboard(ctx.lang),
      });
      return;
    }

    await ctx.reply(t('duel.menu.title', ctx.lang), {
      ...duelMenuKeyboard(ctx.lang),
    });
  });

  bot.action(`${CALLBACK_PREFIX.DUEL}menu`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(t('duel.menu.title', ctx.lang), {
      ...duelMenuKeyboard(ctx.lang),
    });
  });

  bot.action(`${CALLBACK_PREFIX.DUEL}create`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `${t('duel.menu.create', ctx.lang)}\n\n/duel @username`,
      { ...duelTypeKeyboard(ctx.lang) },
    );
  });

  bot.action(`${CALLBACK_PREFIX.DUEL}active`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const duels = await getActiveDuels(ctx.dbUser!.id);

    if (duels.length === 0) {
      await ctx.editMessageText(t('duel.menu.active', ctx.lang) + '\n\n—', {
        ...duelMenuKeyboard(ctx.lang),
      });
      return;
    }

    const lines = duels.map((d) => {
      const status = d.status;
      const type = t(`duel.type.${d.type}`, ctx.lang);
      return `⚔️ ${type} [${status}]`;
    });

    await ctx.editMessageText(lines.join('\n'), {
      ...duelMenuKeyboard(ctx.lang),
    });
  });

  bot.action(/^duel:type:(\w+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.duelDraft = {
      ...ctx.session.duelDraft,
      type: ctx.match[1],
    };
    await ctx.editMessageText(t('duel.select_duration', ctx.lang), {
      ...duelDurationKeyboard(ctx.lang),
    });
  });

  bot.action(/^duel:dur:(\d+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.duelDraft = {
      ...ctx.session.duelDraft,
      durationHours: parseInt(ctx.match[1], 10),
    };
    await ctx.editMessageText(t('duel.select_stake', ctx.lang), {
      ...duelStakeKeyboard(ctx.lang),
    });
  });

  bot.action(/^duel:stake:(\w+):(\d+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const draft = ctx.session.duelDraft;
    if (!draft?.opponentId || !draft.type || !draft.durationHours) {
      await ctx.reply(t('error.generic', ctx.lang));
      return;
    }

    const stakeType = ctx.match[1] as DuelStakeType;
    const stakeAmount = parseInt(ctx.match[2], 10);

    const duel = await createDuel({
      creatorId: ctx.dbUser!.id,
      opponentId: draft.opponentId,
      type: draft.type as DuelType,
      durationHours: draft.durationHours,
      stakeType,
      stakeAmount,
    });

    ctx.session.duelDraft = undefined;

    await ctx.editMessageText(
      t('duel.challenge_sent', ctx.lang, { username: draft.opponentUsername ?? 'player' }),
      { parse_mode: 'HTML' },
    );

    const opponent = duel.participants.find((p) => p.userId === draft.opponentId);
    if (opponent) {
      const { notifyUser } = await import('../index.js');
      try {
        await notifyUser(opponent.user.telegramId, t('duel.received', toI18nLang(opponent.user.language), {
          name: ctx.dbUser!.displayName,
          type: t(`duel.type.${draft.type}`, toI18nLang(opponent.user.language)),
          hours: draft.durationHours,
          stake: `${stakeAmount} ${stakeType}`,
        }), {
          lang: opponent.user.language,
          duelId: duel.id,
        });
      } catch {
        // opponent may have blocked bot
      }
    }
  });

  bot.action(/^duel:accept:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    try {
      const result = await respondToDuel(ctx.match[1], ctx.dbUser!.id, true);
      if (result.accepted) {
        await ctx.editMessageText(t('duel.accepted', ctx.lang), { parse_mode: 'HTML' });
      }
    } catch {
      await ctx.reply(t('error.generic', ctx.lang));
    }
  });

  bot.action(/^duel:decline:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await respondToDuel(ctx.match[1], ctx.dbUser!.id, false);
      await ctx.editMessageText(t('duel.declined', ctx.lang));
    } catch {
      await ctx.reply(t('error.generic', ctx.lang));
    }
  });
}

function toI18nLang(dbLang: string): 'en' | 'ru' | 'ua' {
  const map: Record<string, 'en' | 'ru' | 'ua'> = { EN: 'en', RU: 'ru', UA: 'ua' };
  return map[dbLang] ?? 'en';
}
=======
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import {
  createDuel,
  respondToDuel,
  getActiveDuels,
} from '../../services/duel.service.js';
import { findUserByUsername } from '../../services/user.service.js';
import { duelMenuKeyboard,
  duelTypeKeyboard,
  duelDurationKeyboard,
  duelStakeKeyboard,
} from '../../ui/keyboards.js';
import { CALLBACK_PREFIX } from '../../constants/index.js';
import { parseDuelTarget } from '../../utils/helpers.js';
import { requireUser } from '../middleware/index.js';
import type { DuelStakeType, DuelType } from '@prisma/client';

export function registerDuelHandler(bot: Telegraf<BotContext>) {
  bot.command('duel', requireUser, async (ctx) => {
    const text = ctx.message.text;
    const target = parseDuelTarget(text);

    if (target) {
      const opponent = await findUserByUsername(target);
      if (!opponent) {
        await ctx.reply(t('duel.no_opponent', ctx.lang));
        return;
      }
      if (opponent.id === ctx.dbUser!.id) {
        await ctx.reply(t('duel.self', ctx.lang));
        return;
      }

      ctx.session.duelDraft = {
        opponentId: opponent.id,
        opponentUsername: target,
      };

      await ctx.reply(t('duel.select_type', ctx.lang), {
        ...duelTypeKeyboard(ctx.lang),
      });
      return;
    }

    await ctx.reply(t('duel.menu.title', ctx.lang), {
      ...duelMenuKeyboard(ctx.lang),
    });
  });

  bot.action(`${CALLBACK_PREFIX.DUEL}menu`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(t('duel.menu.title', ctx.lang), {
      ...duelMenuKeyboard(ctx.lang),
    });
  });

  bot.action(`${CALLBACK_PREFIX.DUEL}create`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `${t('duel.menu.create', ctx.lang)}\n\n/duel @username`,
      { ...duelTypeKeyboard(ctx.lang) },
    );
  });

  bot.action(`${CALLBACK_PREFIX.DUEL}active`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const duels = await getActiveDuels(ctx.dbUser!.id);

    if (duels.length === 0) {
      await ctx.editMessageText(t('duel.menu.active', ctx.lang) + '\n\n—', {
        ...duelMenuKeyboard(ctx.lang),
      });
      return;
    }

    const lines = duels.map((d) => {
      const status = d.status;
      const type = t(`duel.type.${d.type}`, ctx.lang);
      return `⚔️ ${type} [${status}]`;
    });

    await ctx.editMessageText(lines.join('\n'), {
      ...duelMenuKeyboard(ctx.lang),
    });
  });

  bot.action(/^duel:type:(\w+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.duelDraft = {
      ...ctx.session.duelDraft,
      type: ctx.match[1],
    };
    await ctx.editMessageText(t('duel.select_duration', ctx.lang), {
      ...duelDurationKeyboard(ctx.lang),
    });
  });

  bot.action(/^duel:dur:(\d+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.duelDraft = {
      ...ctx.session.duelDraft,
      durationHours: parseInt(ctx.match[1], 10),
    };
    await ctx.editMessageText(t('duel.select_stake', ctx.lang), {
      ...duelStakeKeyboard(ctx.lang),
    });
  });

  bot.action(/^duel:stake:(\w+):(\d+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const draft = ctx.session.duelDraft;
    if (!draft?.opponentId || !draft.type || !draft.durationHours) {
      await ctx.reply(t('error.generic', ctx.lang));
      return;
    }

    const stakeType = ctx.match[1] as DuelStakeType;
    const stakeAmount = parseInt(ctx.match[2], 10);

    const duel = await createDuel({
      creatorId: ctx.dbUser!.id,
      opponentId: draft.opponentId,
      type: draft.type as DuelType,
      durationHours: draft.durationHours,
      stakeType,
      stakeAmount,
    });

    ctx.session.duelDraft = undefined;

    await ctx.editMessageText(
      t('duel.challenge_sent', ctx.lang, { username: draft.opponentUsername ?? 'player' }),
      { parse_mode: 'HTML' },
    );

    const opponent = duel.participants.find((p) => p.userId === draft.opponentId);
    if (opponent) {
      const { notifyUser } = await import('../index.js');
      try {
        await notifyUser(opponent.user.telegramId, t('duel.received', toI18nLang(opponent.user.language), {
          name: ctx.dbUser!.displayName,
          type: t(`duel.type.${draft.type}`, toI18nLang(opponent.user.language)),
          hours: draft.durationHours,
          stake: `${stakeAmount} ${stakeType}`,
        }), {
          lang: opponent.user.language,
          duelId: duel.id,
        });
      } catch {
        // opponent may have blocked bot
      }
    }
  });

  bot.action(/^duel:accept:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    try {
      const result = await respondToDuel(ctx.match[1], ctx.dbUser!.id, true);
      if (result.accepted) {
        await ctx.editMessageText(t('duel.accepted', ctx.lang), { parse_mode: 'HTML' });
      }
    } catch {
      await ctx.reply(t('error.generic', ctx.lang));
    }
  });

  bot.action(/^duel:decline:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await respondToDuel(ctx.match[1], ctx.dbUser!.id, false);
      await ctx.editMessageText(t('duel.declined', ctx.lang));
    } catch {
      await ctx.reply(t('error.generic', ctx.lang));
    }
  });
}

function toI18nLang(dbLang: string): 'en' | 'ru' | 'ua' {
  const map: Record<string, 'en' | 'ru' | 'ua'> = { EN: 'en', RU: 'ru', UA: 'ua' };
  return map[dbLang] ?? 'en';
}
>>>>>>> 3fa0ac1 (upload project)
