import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import {
  createParty,
  getPartyInfo,
  leaveParty,
  getPartyDeepLink,
} from '../../services/party.service.js';
import { config } from '../../config/index.js';
import { formatPartyInfo } from '../../ui/formatters.js';
import { partyMenuKeyboard, partyInviteKeyboard } from '../../ui/keyboards.js';
import { CALLBACK_PREFIX } from '../../constants/index.js';
import { requireUser } from '../middleware/index.js';

export function registerPartyHandler(bot: Telegraf<BotContext>) {
  bot.command('party', requireUser, async (ctx) => {
    await showPartyMenu(ctx);
  });

  bot.hears(/^\/party(?:@\w+)?\s+create$/i, requireUser, async (ctx) => {
    ctx.session.awaitingInput = 'party_name';
    await ctx.reply(t('party.create.name', ctx.lang));
  });

  bot.action(`${CALLBACK_PREFIX.PARTY}create`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.awaitingInput = 'party_name';
    await ctx.editMessageText(t('party.create.name', ctx.lang));
  });

  bot.action(`${CALLBACK_PREFIX.PARTY}info`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const info = await getPartyInfo(ctx.dbUser!.id);
    if (!info) {
      await ctx.editMessageText(t('party.not_member', ctx.lang), {
        ...partyMenuKeyboard(ctx.lang, false),
      });
      return;
    }

    await ctx.editMessageText(
      formatPartyInfo(info.party, info.bonus, info.bonusActive, ctx.lang),
      { parse_mode: 'HTML', ...partyMenuKeyboard(ctx.lang, true) },
    );
  });

  bot.action(`${CALLBACK_PREFIX.PARTY}invite`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const info = await getPartyInfo(ctx.dbUser!.id);
    if (!info) return;

    const deepLink = getPartyDeepLink(config.botUsername, info.party.partyCode);

    await ctx.reply(
      t('party.invite_card', ctx.lang, {
        name: info.party.name,
        count: info.party.members.length,
        bonus: info.bonus,
      }),
      {
        parse_mode: 'HTML',
        ...partyInviteKeyboard(deepLink, ctx.lang),
      },
    );
  });

  bot.action(`${CALLBACK_PREFIX.PARTY}leave`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await leaveParty(ctx.dbUser!.id);
      await ctx.editMessageText(t('party.left', ctx.lang), {
        ...partyMenuKeyboard(ctx.lang, false),
      });
    } catch {
      await ctx.answerCbQuery(t('party.not_member', ctx.lang));
    }
  });

  bot.on('text', async (ctx, next) => {
    if (ctx.session.awaitingInput !== 'party_name') return next();
    if (ctx.message.text.startsWith('/')) return next();

    const name = ctx.message.text.trim();
    if (name.length < 2 || name.length > 32) return;

    const user = ctx.dbUser;
    if (!user) return;

    try {
      const party = await createParty(user.id, name);
      ctx.session.awaitingInput = undefined;

      const deepLink = getPartyDeepLink(config.botUsername, party.partyCode);

      await ctx.reply(
        `${t('party.created', ctx.lang, { name })}\n\n<code>${deepLink}</code>`,
        {
          parse_mode: 'HTML',
          ...partyInviteKeyboard(deepLink, ctx.lang),
        },
      );
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'ALREADY_IN_PARTY') {
        await ctx.reply(t('party.already_member', ctx.lang));
      }
    }
  });
}

async function showPartyMenu(ctx: BotContext) {
  const info = await getPartyInfo(ctx.dbUser!.id);
  await ctx.reply(t('party.menu.title', ctx.lang), {
    ...partyMenuKeyboard(ctx.lang, !!info),
  });
}
