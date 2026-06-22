<<<<<<< HEAD
import { Markup } from 'telegraf';
import { t, type SupportedLanguage } from '../i18n/index.js';
import {
  ATTRIBUTES,
  ATTRIBUTE_EMOJI,
  CALLBACK_PREFIX,
  DUEL_DURATIONS,
  DUEL_TYPES,
  TASK_TEMPLATES,
} from '../constants/index.js';

export function languageKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇬🇧 English', `${CALLBACK_PREFIX.LANG}en`),
      Markup.button.callback('🇷🇺 Русский', `${CALLBACK_PREFIX.LANG}ru`),
    ],
    [Markup.button.callback('🇺🇦 Українська', `${CALLBACK_PREFIX.LANG}ua`)],
  ]);
}

export function tutorialKeyboard(lang: SupportedLanguage, step: number) {
  if (step < 4) {
    return Markup.inlineKeyboard([
      [Markup.button.callback(t('button.next', lang), `${CALLBACK_PREFIX.ONBOARD}tutorial:${step + 1}`)],
    ]);
  }
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('button.next', lang), `${CALLBACK_PREFIX.ONBOARD}done`)],
  ]);
}

export function taskMenuKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('task.menu.active', lang), `${CALLBACK_PREFIX.TASK}active`)],
    [
      Markup.button.callback(t('task.menu.create', lang), `${CALLBACK_PREFIX.TASK}create`),
      Markup.button.callback(t('task.menu.templates', lang), `${CALLBACK_PREFIX.TASK}templates`),
    ],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)],
  ]);
}

export function attributeKeyboard(lang: SupportedLanguage, prefix: string) {
  const rows = ATTRIBUTES.map((attr) => [
    Markup.button.callback(
      `${ATTRIBUTE_EMOJI[attr]} ${t(`attribute.${attr}`, lang)}`,
      `${prefix}${attr}`,
    ),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.TASK}menu`)]);
  return Markup.inlineKeyboard(rows);
}

export function taskTemplatesKeyboard(lang: SupportedLanguage) {
  const rows = TASK_TEMPLATES.map((tmpl, i) => [
    Markup.button.callback(
      `${ATTRIBUTE_EMOJI[tmpl.attribute]} ${t(tmpl.titleKey, lang)}`,
      `${CALLBACK_PREFIX.TASK}tmpl:${i}`,
    ),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.TASK}menu`)]);
  return Markup.inlineKeyboard(rows);
}

export function taskActionKeyboard(taskId: string, lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('button.complete', lang), `${CALLBACK_PREFIX.TASK}complete:${taskId}`),
      Markup.button.callback(t('button.cancel', lang), `${CALLBACK_PREFIX.TASK}cancel:${taskId}`),
    ],
  ]);
}

export function proofTypeKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('task.proof.none', lang), `${CALLBACK_PREFIX.TASK}proof:NONE`)],
    [
      Markup.button.callback(t('task.proof.photo', lang), `${CALLBACK_PREFIX.TASK}proof:PHOTO`),
      Markup.button.callback(t('task.proof.video', lang), `${CALLBACK_PREFIX.TASK}proof:VIDEO`),
    ],
    [Markup.button.callback(t('task.proof.friend', lang), `${CALLBACK_PREFIX.TASK}proof:FRIEND`)],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.TASK}menu`)],
  ]);
}

export function partyMenuKeyboard(lang: SupportedLanguage, inParty: boolean) {
  const rows = [];
  if (!inParty) {
    rows.push([Markup.button.callback(t('party.menu.create', lang), `${CALLBACK_PREFIX.PARTY}create`)]);
  } else {
    rows.push([
      Markup.button.callback(t('party.menu.info', lang), `${CALLBACK_PREFIX.PARTY}info`),
      Markup.button.callback(t('party.menu.invite', lang), `${CALLBACK_PREFIX.PARTY}invite`),
    ]);
    rows.push([Markup.button.callback(t('party.menu.leave', lang), `${CALLBACK_PREFIX.PARTY}leave`)]);
  }
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)]);
  return Markup.inlineKeyboard(rows);
}

export function partyInviteKeyboard(deepLink: string, lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.url(t('button.join', lang), deepLink)],
    [Markup.button.switchToChat(t('button.share', lang), `Join my SELFQUEST party! ${deepLink}`)],
  ]);
}

export function duelMenuKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('duel.menu.create', lang), `${CALLBACK_PREFIX.DUEL}create`)],
    [Markup.button.callback(t('duel.menu.active', lang), `${CALLBACK_PREFIX.DUEL}active`)],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)],
  ]);
}

export function duelTypeKeyboard(lang: SupportedLanguage) {
  const rows = DUEL_TYPES.map((type) => [
    Markup.button.callback(t(`duel.type.${type}`, lang), `${CALLBACK_PREFIX.DUEL}type:${type}`),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.DUEL}menu`)]);
  return Markup.inlineKeyboard(rows);
}

export function duelDurationKeyboard(lang: SupportedLanguage) {
  const rows = DUEL_DURATIONS.map((h) => [
    Markup.button.callback(t('duel.duration.h', lang, { hours: h }), `${CALLBACK_PREFIX.DUEL}dur:${h}`),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.DUEL}create`)]);
  return Markup.inlineKeyboard(rows);
}

export function duelStakeKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('duel.stake.xp', lang), `${CALLBACK_PREFIX.DUEL}stake:XP:50`)],
    [Markup.button.callback(t('duel.stake.coins', lang), `${CALLBACK_PREFIX.DUEL}stake:SOUL_COINS:25`)],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.DUEL}create`)],
  ]);
}

export function duelResponseKeyboard(duelId: string, lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('button.accept', lang), `${CALLBACK_PREFIX.DUEL}accept:${duelId}`),
      Markup.button.callback(t('button.decline', lang), `${CALLBACK_PREFIX.DUEL}decline:${duelId}`),
    ],
  ]);
}

export function leaderboardKeyboard(_lang: SupportedLanguage, period = 'global', _category = 'xp') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🌍', `${CALLBACK_PREFIX.LB}global:xp`),
      Markup.button.callback('📅', `${CALLBACK_PREFIX.LB}weekly:xp`),
      Markup.button.callback('📆', `${CALLBACK_PREFIX.LB}monthly:xp`),
      Markup.button.callback('🌟', `${CALLBACK_PREFIX.LB}seasonal:xp`),
    ],
    [
      Markup.button.callback('Lv', `${CALLBACK_PREFIX.LB}${period}:level`),
      Markup.button.callback('XP', `${CALLBACK_PREFIX.LB}${period}:xp`),
      Markup.button.callback('ELO', `${CALLBACK_PREFIX.LB}${period}:elo`),
      Markup.button.callback('🔥', `${CALLBACK_PREFIX.LB}${period}:streak`),
    ],
  ]);
}

export function settingsKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇬🇧 EN', `${CALLBACK_PREFIX.SETTINGS}lang:en`),
      Markup.button.callback('🇷🇺 RU', `${CALLBACK_PREFIX.SETTINGS}lang:ru`),
      Markup.button.callback('🇺🇦 UA', `${CALLBACK_PREFIX.SETTINGS}lang:ua`),
    ],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)],
  ]);
}

export function inventoryKeyboard(
  items: Array<{ itemId: string; type: string; nameKey: string; imageEmoji: string }>,
  lang: SupportedLanguage,
) {
  const rows = items.slice(0, 8).map((item) => [
    Markup.button.callback(
      `${item.imageEmoji} ${t(item.nameKey, lang)}`,
      `${CALLBACK_PREFIX.INV}equip:${item.itemId}`,
    ),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)]);
  return Markup.inlineKeyboard(rows);
}

export function mainMenuKeyboard(_lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📋 Task', `${CALLBACK_PREFIX.NAV}task`),
      Markup.button.callback('👥 Party', `${CALLBACK_PREFIX.NAV}party`),
    ],
    [
      Markup.button.callback('⚔️ Duel', `${CALLBACK_PREFIX.NAV}duel`),
      Markup.button.callback('🏆 Rank', `${CALLBACK_PREFIX.NAV}lb`),
    ],
  ]);
}
=======
import { Markup } from 'telegraf';
import { t, type SupportedLanguage } from '../i18n/index.js';
import {
  ATTRIBUTES,
  ATTRIBUTE_EMOJI,
  CALLBACK_PREFIX,
  DUEL_DURATIONS,
  DUEL_TYPES,
  TASK_TEMPLATES,
} from '../constants/index.js';

export function languageKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇬🇧 English', `${CALLBACK_PREFIX.LANG}en`),
      Markup.button.callback('🇷🇺 Русский', `${CALLBACK_PREFIX.LANG}ru`),
    ],
    [Markup.button.callback('🇺🇦 Українська', `${CALLBACK_PREFIX.LANG}ua`)],
  ]);
}

export function tutorialKeyboard(lang: SupportedLanguage, step: number) {
  if (step < 4) {
    return Markup.inlineKeyboard([
      [Markup.button.callback(t('button.next', lang), `${CALLBACK_PREFIX.ONBOARD}tutorial:${step + 1}`)],
    ]);
  }
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('button.next', lang), `${CALLBACK_PREFIX.ONBOARD}done`)],
  ]);
}

export function taskMenuKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('task.menu.active', lang), `${CALLBACK_PREFIX.TASK}active`)],
    [
      Markup.button.callback(t('task.menu.create', lang), `${CALLBACK_PREFIX.TASK}create`),
      Markup.button.callback(t('task.menu.templates', lang), `${CALLBACK_PREFIX.TASK}templates`),
    ],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)],
  ]);
}

export function attributeKeyboard(lang: SupportedLanguage, prefix: string) {
  const rows = ATTRIBUTES.map((attr) => [
    Markup.button.callback(
      `${ATTRIBUTE_EMOJI[attr]} ${t(`attribute.${attr}`, lang)}`,
      `${prefix}${attr}`,
    ),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.TASK}menu`)]);
  return Markup.inlineKeyboard(rows);
}

export function taskTemplatesKeyboard(lang: SupportedLanguage) {
  const rows = TASK_TEMPLATES.map((tmpl, i) => [
    Markup.button.callback(
      `${ATTRIBUTE_EMOJI[tmpl.attribute]} ${t(tmpl.titleKey, lang)}`,
      `${CALLBACK_PREFIX.TASK}tmpl:${i}`,
    ),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.TASK}menu`)]);
  return Markup.inlineKeyboard(rows);
}

export function taskActionKeyboard(taskId: string, lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('button.complete', lang), `${CALLBACK_PREFIX.TASK}complete:${taskId}`),
      Markup.button.callback(t('button.cancel', lang), `${CALLBACK_PREFIX.TASK}cancel:${taskId}`),
    ],
  ]);
}

export function proofTypeKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('task.proof.none', lang), `${CALLBACK_PREFIX.TASK}proof:NONE`)],
    [
      Markup.button.callback(t('task.proof.photo', lang), `${CALLBACK_PREFIX.TASK}proof:PHOTO`),
      Markup.button.callback(t('task.proof.video', lang), `${CALLBACK_PREFIX.TASK}proof:VIDEO`),
    ],
    [Markup.button.callback(t('task.proof.friend', lang), `${CALLBACK_PREFIX.TASK}proof:FRIEND`)],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.TASK}menu`)],
  ]);
}

export function partyMenuKeyboard(lang: SupportedLanguage, inParty: boolean) {
  const rows = [];
  if (!inParty) {
    rows.push([Markup.button.callback(t('party.menu.create', lang), `${CALLBACK_PREFIX.PARTY}create`)]);
  } else {
    rows.push([
      Markup.button.callback(t('party.menu.info', lang), `${CALLBACK_PREFIX.PARTY}info`),
      Markup.button.callback(t('party.menu.invite', lang), `${CALLBACK_PREFIX.PARTY}invite`),
    ]);
    rows.push([Markup.button.callback(t('party.menu.leave', lang), `${CALLBACK_PREFIX.PARTY}leave`)]);
  }
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)]);
  return Markup.inlineKeyboard(rows);
}

export function partyInviteKeyboard(deepLink: string, lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.url(t('button.join', lang), deepLink)],
    [Markup.button.switchToChat(t('button.share', lang), `Join my SELFQUEST party! ${deepLink}`)],
  ]);
}

export function duelMenuKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('duel.menu.create', lang), `${CALLBACK_PREFIX.DUEL}create`)],
    [Markup.button.callback(t('duel.menu.active', lang), `${CALLBACK_PREFIX.DUEL}active`)],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)],
  ]);
}

export function duelTypeKeyboard(lang: SupportedLanguage) {
  const rows = DUEL_TYPES.map((type) => [
    Markup.button.callback(t(`duel.type.${type}`, lang), `${CALLBACK_PREFIX.DUEL}type:${type}`),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.DUEL}menu`)]);
  return Markup.inlineKeyboard(rows);
}

export function duelDurationKeyboard(lang: SupportedLanguage) {
  const rows = DUEL_DURATIONS.map((h) => [
    Markup.button.callback(t('duel.duration.h', lang, { hours: h }), `${CALLBACK_PREFIX.DUEL}dur:${h}`),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.DUEL}create`)]);
  return Markup.inlineKeyboard(rows);
}

export function duelStakeKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('duel.stake.xp', lang), `${CALLBACK_PREFIX.DUEL}stake:XP:50`)],
    [Markup.button.callback(t('duel.stake.coins', lang), `${CALLBACK_PREFIX.DUEL}stake:SOUL_COINS:25`)],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.DUEL}create`)],
  ]);
}

export function duelResponseKeyboard(duelId: string, lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('button.accept', lang), `${CALLBACK_PREFIX.DUEL}accept:${duelId}`),
      Markup.button.callback(t('button.decline', lang), `${CALLBACK_PREFIX.DUEL}decline:${duelId}`),
    ],
  ]);
}

export function leaderboardKeyboard(_lang: SupportedLanguage, period = 'global', _category = 'xp') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🌍', `${CALLBACK_PREFIX.LB}global:xp`),
      Markup.button.callback('📅', `${CALLBACK_PREFIX.LB}weekly:xp`),
      Markup.button.callback('📆', `${CALLBACK_PREFIX.LB}monthly:xp`),
      Markup.button.callback('🌟', `${CALLBACK_PREFIX.LB}seasonal:xp`),
    ],
    [
      Markup.button.callback('Lv', `${CALLBACK_PREFIX.LB}${period}:level`),
      Markup.button.callback('XP', `${CALLBACK_PREFIX.LB}${period}:xp`),
      Markup.button.callback('ELO', `${CALLBACK_PREFIX.LB}${period}:elo`),
      Markup.button.callback('🔥', `${CALLBACK_PREFIX.LB}${period}:streak`),
    ],
  ]);
}

export function settingsKeyboard(lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇬🇧 EN', `${CALLBACK_PREFIX.SETTINGS}lang:en`),
      Markup.button.callback('🇷🇺 RU', `${CALLBACK_PREFIX.SETTINGS}lang:ru`),
      Markup.button.callback('🇺🇦 UA', `${CALLBACK_PREFIX.SETTINGS}lang:ua`),
    ],
    [Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)],
  ]);
}

export function inventoryKeyboard(
  items: Array<{ itemId: string; type: string; nameKey: string; imageEmoji: string }>,
  lang: SupportedLanguage,
) {
  const rows = items.slice(0, 8).map((item) => [
    Markup.button.callback(
      `${item.imageEmoji} ${t(item.nameKey, lang)}`,
      `${CALLBACK_PREFIX.INV}equip:${item.itemId}`,
    ),
  ]);
  rows.push([Markup.button.callback(t('button.back', lang), `${CALLBACK_PREFIX.NAV}main`)]);
  return Markup.inlineKeyboard(rows);
}

export function mainMenuKeyboard(_lang: SupportedLanguage) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📋 Task', `${CALLBACK_PREFIX.NAV}task`),
      Markup.button.callback('👥 Party', `${CALLBACK_PREFIX.NAV}party`),
    ],
    [
      Markup.button.callback('⚔️ Duel', `${CALLBACK_PREFIX.NAV}duel`),
      Markup.button.callback('🏆 Rank', `${CALLBACK_PREFIX.NAV}lb`),
    ],
  ]);
}
>>>>>>> 3fa0ac1 (upload project)
