import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import {
  createTask,
  getActiveTasks,
  completeTask,
  cancelTask,
  getFirstActiveTask,
} from '../../services/task.service.js';
import { updateDuelProgress } from '../../services/duel.service.js';
import { grantCaseToUser } from '../../services/inventory.service.js';
import { TASK_TEMPLATES } from '../../constants/index.js';
import {
  taskMenuKeyboard,
  attributeKeyboard,
  taskTemplatesKeyboard,
  taskActionKeyboard,
  proofTypeKeyboard,
} from '../../ui/keyboards.js';
import { CALLBACK_PREFIX } from '../../constants/index.js';
import { requireUser } from '../middleware/index.js';
import type { Attribute, ProofType } from '@prisma/client';

export function registerTaskHandler(bot: Telegraf<BotContext>) {
  bot.command('task', requireUser, async (ctx) => {
    await showTaskMenu(ctx);
  });

  bot.command('done', requireUser, async (ctx) => {
    const user = ctx.dbUser!;
    const task = await getFirstActiveTask(user.id);

    if (!task) {
      await ctx.reply(t('task.no_active', ctx.lang));
      return;
    }

    await handleTaskComplete(ctx, task.id);
  });

  bot.action(`${CALLBACK_PREFIX.TASK}menu`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await showTaskMenu(ctx, true);
  });

  bot.action(`${CALLBACK_PREFIX.TASK}active`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const tasks = await getActiveTasks(ctx.dbUser!.id);

    if (tasks.length === 0) {
      await ctx.editMessageText(t('task.no_active', ctx.lang), {
        ...taskMenuKeyboard(ctx.lang),
      });
      return;
    }

    for (const task of tasks) {
      await ctx.reply(
        `📋 <b>${task.title}</b>\n+${task.xpReward} XP | ${t(`attribute.${task.attribute}`, ctx.lang)}`,
        {
          parse_mode: 'HTML',
          ...taskActionKeyboard(task.id, ctx.lang),
        },
      );
    }
  });

  bot.action(`${CALLBACK_PREFIX.TASK}create`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(t('task.select_attribute', ctx.lang), {
      ...attributeKeyboard(ctx.lang, `${CALLBACK_PREFIX.TASK}attr:`),
    });
  });

  bot.action(`${CALLBACK_PREFIX.TASK}templates`, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(t('task.menu.templates', ctx.lang), {
      ...taskTemplatesKeyboard(ctx.lang),
    });
  });

  bot.action(/^task:tmpl:(\d+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const idx = parseInt(ctx.match[1], 10);
    const template = TASK_TEMPLATES[idx];
    if (!template) return;

    const user = ctx.dbUser!;
    const task = await createTask({
      userId: user.id,
      title: t(template.titleKey, ctx.lang),
      attribute: template.attribute as Attribute,
      xpReward: template.xp,
      attributeXp: template.attrXp,
    });

    await ctx.editMessageText(
      t('task.created', ctx.lang, {
        title: t(template.titleKey, ctx.lang),
        xp: template.xp,
        attribute: t(`attribute.${template.attribute}`, ctx.lang),
      }),
      { parse_mode: 'HTML', ...taskActionKeyboard(task.id, ctx.lang) },
    );
  });

  bot.action(/^task:attr:(\w+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const attribute = ctx.match[1];
    ctx.session.taskDraft = { attribute };
    ctx.session.awaitingInput = 'task_custom';

    await ctx.editMessageText(t('task.enter_custom', ctx.lang), {
      ...proofTypeKeyboard(ctx.lang),
    });
  });

  bot.action(/^task:proof:(\w+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const proofType = ctx.match[1] as ProofType;
    ctx.session.taskDraft = { ...ctx.session.taskDraft, proofType };
    ctx.session.awaitingInput = 'task_custom';

    await ctx.editMessageText(t('task.enter_custom', ctx.lang));
  });

  bot.action(/^task:complete:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    await handleTaskComplete(ctx, ctx.match[1]);
  });

  bot.action(/^task:cancel:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const task = await cancelTask(ctx.match[1], ctx.dbUser!.id);
    if (task) {
      await ctx.editMessageText(t('task.cancelled', ctx.lang), {
        ...taskMenuKeyboard(ctx.lang),
      });
    }
  });

  bot.on('text', async (ctx, next) => {
    if (ctx.session.awaitingInput !== 'task_custom') return next();
    if (ctx.message.text.startsWith('/')) return next();

    const draft = ctx.session.taskDraft;
    if (!draft?.attribute) return next();

    const title = ctx.message.text.trim();
    if (title.length < 2) return;

    const user = ctx.dbUser;
    if (!user) return;

    const task = await createTask({
      userId: user.id,
      title,
      attribute: draft.attribute as Attribute,
      proofType: (draft.proofType as ProofType) ?? 'NONE',
    });

    ctx.session.awaitingInput = undefined;
    ctx.session.taskDraft = undefined;

    await ctx.reply(
      t('task.created', ctx.lang, {
        title,
        xp: task.xpReward,
        attribute: t(`attribute.${draft.attribute}`, ctx.lang),
      }),
      { parse_mode: 'HTML', ...taskActionKeyboard(task.id, ctx.lang) },
    );
  });
}

async function showTaskMenu(ctx: BotContext, edit = false) {
  const text = t('task.menu.title', ctx.lang);
  const keyboard = taskMenuKeyboard(ctx.lang);

  if (edit && ctx.callbackQuery) {
    await ctx.editMessageText(text, keyboard);
  } else {
    await ctx.reply(text, keyboard);
  }
}

async function handleTaskComplete(ctx: BotContext, taskId: string) {
  const user = ctx.dbUser!;
  const result = await completeTask(taskId, user.id);

  if (!result) {
    await ctx.reply(t('error.generic', ctx.lang));
    return;
  }

  const { task, xpResult } = result;

  await updateDuelProgress(user.id, xpResult.totalXp, true);

  let message = t('task.completed', ctx.lang, {
    title: task.title,
    xp: xpResult.totalXp,
    attrXp: xpResult.attributeXp,
    attribute: t(`attribute.${task.attribute}`, ctx.lang),
  });

  if (xpResult.leveledUp) {
    message += `\n\n${t('levelup.title', ctx.lang)}\n${t('levelup.message', ctx.lang, {
      level: xpResult.newLevel,
      coins: xpResult.coinsEarned,
    })}`;

    if (xpResult.caseGranted) {
      await grantCaseToUser(user.id);
      message += `\n${t('levelup.case', ctx.lang)}`;
    }
  }

  if (xpResult.streakMilestone) {
    message += `\n\n${t('streak.milestone', ctx.lang, {
      days: xpResult.streakMilestone,
      xp: xpResult.streakMilestone * 10,
      coins: xpResult.streakMilestone * 5,
    })}`;
  }

  if (ctx.callbackQuery) {
    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      ...taskMenuKeyboard(ctx.lang),
    });
  } else {
    await ctx.reply(message, { parse_mode: 'HTML' });
  }
}
