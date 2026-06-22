<<<<<<< HEAD
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t, toDbLang } from '../../i18n/index.js';
import { findUserByTelegramId, createUser, updateUserLanguage } from '../../services/user.service.js';
import { joinPartyByCode } from '../../services/party.service.js';
import { createTask } from '../../services/task.service.js';
import { TASK_TEMPLATES } from '../../constants/index.js';
import { formatWelcome } from '../../ui/formatters.js';
import { languageKeyboard, tutorialKeyboard, taskActionKeyboard } from '../../ui/keyboards.js';
import { parseStartPayload } from '../../utils/helpers.js';
import type { Attribute } from '@prisma/client';

export function registerStartHandler(bot: Telegraf<BotContext>) {
  bot.start(async (ctx) => {
    const telegramId = ctx.from!.id;
    const payload = parseStartPayload(ctx.message.text);

    if (payload?.startsWith('party_')) {
      const partyCode = payload.replace('party_', '');
      const user = await findUserByTelegramId(telegramId);

      if (user?.onboardingDone) {
        try {
          const party = await joinPartyByCode(user.id, partyCode);
          await ctx.reply(
            t('party.joined', ctx.lang, { name: party.name }),
            { parse_mode: 'HTML' },
          );
          return;
        } catch (err) {
          const msg = (err as Error).message;
          if (msg === 'ALREADY_IN_PARTY') {
            await ctx.reply(t('party.already_member', ctx.lang));
            return;
          }
          if (msg === 'PARTY_FULL') {
            await ctx.reply(t('party.full', ctx.lang));
            return;
          }
          if (msg === 'PARTY_NOT_FOUND') {
            await ctx.reply(t('error.generic', ctx.lang));
            return;
          }
        }
      }
    }

    let user = await findUserByTelegramId(telegramId);

    if (user?.onboardingDone) {
      ctx.dbUser = user;
      await ctx.reply(formatWelcome(ctx.lang), {
        parse_mode: 'HTML',
        ...languageKeyboard(),
      });
      return;
    }

    if (!user) {
      user = await createUser({
        telegramId,
        username: ctx.from!.username,
        displayName: ctx.from!.first_name ?? 'Hero',
        language: 'EN',
      });
    }

    if (!user) return;

    ctx.dbUser = user;
    await ctx.reply(formatWelcome('en'), {
      parse_mode: 'HTML',
      ...languageKeyboard(),
    });
  });

  bot.action(/^lang:(en|ru|ua)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const lang = ctx.match[1] as 'en' | 'ru' | 'ua';
    ctx.lang = lang;

    const telegramId = ctx.from!.id;
    let user = await findUserByTelegramId(telegramId);

    if (!user) {
      user = await createUser({
        telegramId,
        username: ctx.from!.username,
        displayName: ctx.from!.first_name ?? 'Hero',
        language: toDbLang(lang),
      });
    } else {
      user = await updateUserLanguage(user.id, toDbLang(lang));
    }

    if (!user) return;

    ctx.dbUser = user;

    if (user.onboardingDone) {
      await ctx.editMessageText(t('settings.updated', lang), { parse_mode: 'HTML' });
      return;
    }

    ctx.session.awaitingInput = 'display_name';
    await ctx.editMessageText(
      `${t('onboard.profile.title', lang)}\n\n${t('onboard.profile.prompt', lang)}`,
      { parse_mode: 'HTML' },
    );
  });

  bot.on('text', async (ctx, next) => {
    if (ctx.session.awaitingInput !== 'display_name') return next();
    if (ctx.message.text.startsWith('/')) return next();

    const name = ctx.message.text.trim();
    const lang = ctx.lang;

    if (name.length < 2 || name.length > 32) {
      await ctx.reply(t('onboard.profile.invalid', lang));
      return;
    }

    const telegramId = ctx.from!.id;
    const user = await findUserByTelegramId(telegramId);
    if (!user) return;

    const { prisma } = await import('../../database/prisma.js');
    await prisma.user.update({
      where: { id: user.id },
      data: { displayName: name },
    });

    ctx.session.awaitingInput = undefined;
    ctx.dbUser = { ...user, displayName: name };

    await ctx.reply(t('onboard.tutorial.title', lang), {
      parse_mode: 'HTML',
      ...tutorialKeyboard(lang, 1),
    });

    await ctx.reply(t('onboard.tutorial.step1', lang), { parse_mode: 'HTML' });
  });

  bot.action(/^onboard:tutorial:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const step = parseInt(ctx.match[1], 10);
    const lang = ctx.lang;

    const stepKey = `onboard.tutorial.step${step}` as 'onboard.tutorial.step1';
    await ctx.editMessageText(t(stepKey, lang), {
      parse_mode: 'HTML',
      ...tutorialKeyboard(lang, step),
    });
  });

  bot.action('onboard:done', async (ctx) => {
    await ctx.answerCbQuery();
    const lang = ctx.lang;
    const user = ctx.dbUser;
    if (!user) return;

    const { prisma } = await import('../../database/prisma.js');
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingDone: true, tutorialDone: true },
    });

    const template = TASK_TEMPLATES[0];
    const task = await createTask({
      userId: user.id,
      title: t(template.titleKey, lang),
      attribute: template.attribute as Attribute,
      xpReward: template.xp,
      attributeXp: template.attrXp,
    });

    await ctx.editMessageText(
      `${t('onboard.complete', lang, { name: user.displayName })}\n\n${t('onboard.tutorial.done', lang)}`,
      { parse_mode: 'HTML' },
    );

    await ctx.reply(
      t('task.created', lang, {
        title: t(template.titleKey, lang),
        xp: template.xp,
        attribute: t(`attribute.${template.attribute}`, lang),
      }),
      { parse_mode: 'HTML', ...taskActionKeyboard(task.id, lang) },
    );
  });
}
=======
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t, toDbLang } from '../../i18n/index.js';
import { findUserByTelegramId, createUser, updateUserLanguage } from '../../services/user.service.js';
import { joinPartyByCode } from '../../services/party.service.js';
import { createTask } from '../../services/task.service.js';
import { TASK_TEMPLATES } from '../../constants/index.js';
import { formatWelcome } from '../../ui/formatters.js';
import { languageKeyboard, tutorialKeyboard, taskActionKeyboard } from '../../ui/keyboards.js';
import { parseStartPayload } from '../../utils/helpers.js';
import type { Attribute } from '@prisma/client';

export function registerStartHandler(bot: Telegraf<BotContext>) {
  bot.start(async (ctx) => {
    const telegramId = ctx.from!.id;
    const payload = parseStartPayload(ctx.message.text);

    if (payload?.startsWith('party_')) {
      const partyCode = payload.replace('party_', '');
      const user = await findUserByTelegramId(telegramId);

      if (user?.onboardingDone) {
        try {
          const party = await joinPartyByCode(user.id, partyCode);
          await ctx.reply(
            t('party.joined', ctx.lang, { name: party.name }),
            { parse_mode: 'HTML' },
          );
          return;
        } catch (err) {
          const msg = (err as Error).message;
          if (msg === 'ALREADY_IN_PARTY') {
            await ctx.reply(t('party.already_member', ctx.lang));
            return;
          }
          if (msg === 'PARTY_FULL') {
            await ctx.reply(t('party.full', ctx.lang));
            return;
          }
          if (msg === 'PARTY_NOT_FOUND') {
            await ctx.reply(t('error.generic', ctx.lang));
            return;
          }
        }
      }
    }

    let user = await findUserByTelegramId(telegramId);

    if (user?.onboardingDone) {
      ctx.dbUser = user;
      await ctx.reply(formatWelcome(ctx.lang), {
        parse_mode: 'HTML',
        ...languageKeyboard(),
      });
      return;
    }

    if (!user) {
      user = await createUser({
        telegramId,
        username: ctx.from!.username,
        displayName: ctx.from!.first_name ?? 'Hero',
        language: 'EN',
      });
    }

    if (!user) return;

    ctx.dbUser = user;
    await ctx.reply(formatWelcome('en'), {
      parse_mode: 'HTML',
      ...languageKeyboard(),
    });
  });

  bot.action(/^lang:(en|ru|ua)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const lang = ctx.match[1] as 'en' | 'ru' | 'ua';
    ctx.lang = lang;

    const telegramId = ctx.from!.id;
    let user = await findUserByTelegramId(telegramId);

    if (!user) {
      user = await createUser({
        telegramId,
        username: ctx.from!.username,
        displayName: ctx.from!.first_name ?? 'Hero',
        language: toDbLang(lang),
      });
    } else {
      user = await updateUserLanguage(user.id, toDbLang(lang));
    }

    if (!user) return;

    ctx.dbUser = user;

    if (user.onboardingDone) {
      await ctx.editMessageText(t('settings.updated', lang), { parse_mode: 'HTML' });
      return;
    }

    ctx.session.awaitingInput = 'display_name';
    await ctx.editMessageText(
      `${t('onboard.profile.title', lang)}\n\n${t('onboard.profile.prompt', lang)}`,
      { parse_mode: 'HTML' },
    );
  });

  bot.on('text', async (ctx, next) => {
    if (ctx.session.awaitingInput !== 'display_name') return next();
    if (ctx.message.text.startsWith('/')) return next();

    const name = ctx.message.text.trim();
    const lang = ctx.lang;

    if (name.length < 2 || name.length > 32) {
      await ctx.reply(t('onboard.profile.invalid', lang));
      return;
    }

    const telegramId = ctx.from!.id;
    const user = await findUserByTelegramId(telegramId);
    if (!user) return;

    const { prisma } = await import('../../database/prisma.js');
    await prisma.user.update({
      where: { id: user.id },
      data: { displayName: name },
    });

    ctx.session.awaitingInput = undefined;
    ctx.dbUser = { ...user, displayName: name };

    await ctx.reply(t('onboard.tutorial.title', lang), {
      parse_mode: 'HTML',
      ...tutorialKeyboard(lang, 1),
    });

    await ctx.reply(t('onboard.tutorial.step1', lang), { parse_mode: 'HTML' });
  });

  bot.action(/^onboard:tutorial:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const step = parseInt(ctx.match[1], 10);
    const lang = ctx.lang;

    const stepKey = `onboard.tutorial.step${step}` as 'onboard.tutorial.step1';
    await ctx.editMessageText(t(stepKey, lang), {
      parse_mode: 'HTML',
      ...tutorialKeyboard(lang, step),
    });
  });

  bot.action('onboard:done', async (ctx) => {
    await ctx.answerCbQuery();
    const lang = ctx.lang;
    const user = ctx.dbUser;
    if (!user) return;

    const { prisma } = await import('../../database/prisma.js');
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingDone: true, tutorialDone: true },
    });

    const template = TASK_TEMPLATES[0];
    const task = await createTask({
      userId: user.id,
      title: t(template.titleKey, lang),
      attribute: template.attribute as Attribute,
      xpReward: template.xp,
      attributeXp: template.attrXp,
    });

    await ctx.editMessageText(
      `${t('onboard.complete', lang, { name: user.displayName })}\n\n${t('onboard.tutorial.done', lang)}`,
      { parse_mode: 'HTML' },
    );

    await ctx.reply(
      t('task.created', lang, {
        title: t(template.titleKey, lang),
        xp: template.xp,
        attribute: t(`attribute.${template.attribute}`, lang),
      }),
      { parse_mode: 'HTML', ...taskActionKeyboard(task.id, lang) },
    );
  });
}
>>>>>>> 3fa0ac1 (upload project)
