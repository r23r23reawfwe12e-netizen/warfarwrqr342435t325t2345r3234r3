import type { Context } from 'telegraf';
import type { SupportedLanguage } from '../i18n/index.js';
import type { findUserByTelegramId } from '../services/user.service.js';

export interface SessionData {
  awaitingInput?: 'display_name' | 'task_title' | 'task_custom' | 'party_name' | 'duel_opponent';
  taskDraft?: {
    attribute?: string;
    title?: string;
    proofType?: string;
  };
  duelDraft?: {
    opponentId?: string;
    opponentUsername?: string;
    type?: string;
    durationHours?: number;
    stakeType?: string;
    stakeAmount?: number;
  };
}

export type DbUser = NonNullable<Awaited<ReturnType<typeof findUserByTelegramId>>>;

export interface BotContext extends Context {
  dbUser?: DbUser;
  lang: SupportedLanguage;
  session: SessionData;
}
