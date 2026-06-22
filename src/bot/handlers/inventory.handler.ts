<<<<<<< HEAD
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import {
  getUserInventory,
  equipItem,
  openCase,
} from '../../services/inventory.service.js';
import { formatInventoryItem } from '../../ui/formatters.js';
import { inventoryKeyboard } from '../../ui/keyboards.js';
import { requireUser } from '../middleware/index.js';

export function registerInventoryHandler(bot: Telegraf<BotContext>) {
  bot.command('inventory', requireUser, async (ctx) => {
    await showInventory(ctx);
  });

  bot.action(/^inv:equip:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const itemId = ctx.match[1];
    const user = ctx.dbUser!;

    try {
      const item = await getUserInventory(user.id);
      const invItem = item.find((i) => i.itemId === itemId);
      if (!invItem) return;

      if (invItem.item.type === 'CASE') {
        const result = await openCase(user.id, itemId);
        await ctx.reply(
          t('inventory.case_opened', ctx.lang, {
            item: t(result.item.nameKey, ctx.lang),
            rarity: result.rarityEmoji,
          }),
          { parse_mode: 'HTML' },
        );
        return;
      }

      await equipItem(user.id, itemId);
      await ctx.answerCbQuery(t('inventory.equipped', ctx.lang));
      await showInventory(ctx, true);
    } catch {
      await ctx.reply(t('error.generic', ctx.lang));
    }
  });
}

async function showInventory(ctx: BotContext, edit = false) {
  const items = await getUserInventory(ctx.dbUser!.id);

  if (items.length === 0) {
    const text = `${t('inventory.title', ctx.lang)}\n\n${t('inventory.empty', ctx.lang)}`;
    if (edit && ctx.callbackQuery) {
      await ctx.editMessageText(text);
    } else {
      await ctx.reply(text);
    }
    return;
  }

  const lines = items.map((inv) =>
    formatInventoryItem(inv.item, inv.quantity, ctx.lang),
  );

  const keyboardItems = items.map((inv) => ({
    itemId: inv.itemId,
    type: inv.item.type,
    nameKey: inv.item.nameKey,
    imageEmoji: inv.item.imageEmoji,
  }));

  const text = `${t('inventory.title', ctx.lang)}\n\n${lines.join('\n')}`;
  const keyboard = inventoryKeyboard(keyboardItems, ctx.lang);

  if (edit && ctx.callbackQuery) {
    await ctx.editMessageText(text, keyboard);
  } else {
    await ctx.reply(text, keyboard);
  }
}
=======
import type { Telegraf } from 'telegraf';
import type { BotContext } from '../../types/context.js';
import { t } from '../../i18n/index.js';
import {
  getUserInventory,
  equipItem,
  openCase,
} from '../../services/inventory.service.js';
import { formatInventoryItem } from '../../ui/formatters.js';
import { inventoryKeyboard } from '../../ui/keyboards.js';
import { requireUser } from '../middleware/index.js';

export function registerInventoryHandler(bot: Telegraf<BotContext>) {
  bot.command('inventory', requireUser, async (ctx) => {
    await showInventory(ctx);
  });

  bot.action(/^inv:equip:(.+)$/, requireUser, async (ctx) => {
    await ctx.answerCbQuery();
    const itemId = ctx.match[1];
    const user = ctx.dbUser!;

    try {
      const item = await getUserInventory(user.id);
      const invItem = item.find((i) => i.itemId === itemId);
      if (!invItem) return;

      if (invItem.item.type === 'CASE') {
        const result = await openCase(user.id, itemId);
        await ctx.reply(
          t('inventory.case_opened', ctx.lang, {
            item: t(result.item.nameKey, ctx.lang),
            rarity: result.rarityEmoji,
          }),
          { parse_mode: 'HTML' },
        );
        return;
      }

      await equipItem(user.id, itemId);
      await ctx.answerCbQuery(t('inventory.equipped', ctx.lang));
      await showInventory(ctx, true);
    } catch {
      await ctx.reply(t('error.generic', ctx.lang));
    }
  });
}

async function showInventory(ctx: BotContext, edit = false) {
  const items = await getUserInventory(ctx.dbUser!.id);

  if (items.length === 0) {
    const text = `${t('inventory.title', ctx.lang)}\n\n${t('inventory.empty', ctx.lang)}`;
    if (edit && ctx.callbackQuery) {
      await ctx.editMessageText(text);
    } else {
      await ctx.reply(text);
    }
    return;
  }

  const lines = items.map((inv) =>
    formatInventoryItem(inv.item, inv.quantity, ctx.lang),
  );

  const keyboardItems = items.map((inv) => ({
    itemId: inv.itemId,
    type: inv.item.type,
    nameKey: inv.item.nameKey,
    imageEmoji: inv.item.imageEmoji,
  }));

  const text = `${t('inventory.title', ctx.lang)}\n\n${lines.join('\n')}`;
  const keyboard = inventoryKeyboard(keyboardItems, ctx.lang);

  if (edit && ctx.callbackQuery) {
    await ctx.editMessageText(text, keyboard);
  } else {
    await ctx.reply(text, keyboard);
  }
}
>>>>>>> 3fa0ac1 (upload project)
