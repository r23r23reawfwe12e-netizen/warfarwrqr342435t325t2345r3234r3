<<<<<<< HEAD
import i18next from 'i18next';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export type SupportedLanguage = 'en' | 'ru' | 'ua';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadLocale(name: string): Record<string, string> {
  return JSON.parse(readFileSync(join(__dirname, 'locales', `${name}.json`), 'utf-8'));
}

const langMap: Record<string, SupportedLanguage> = {
  EN: 'en',
  RU: 'ru',
  UA: 'ua',
  en: 'en',
  ru: 'ru',
  ua: 'ua',
};

export function toI18nLang(dbLang: string): SupportedLanguage {
  return langMap[dbLang] ?? 'en';
}

export function toDbLang(i18nLang: SupportedLanguage): 'EN' | 'RU' | 'UA' {
  return i18nLang.toUpperCase() as 'EN' | 'RU' | 'UA';
}

const i18n = i18next.createInstance();

let initialized = false;

export async function initI18n(): Promise<void> {
  if (initialized) return;
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: loadLocale('en') },
      ru: { translation: loadLocale('ru') },
      ua: { translation: loadLocale('ua') },
    },
    interpolation: { escapeValue: false },
  });
  initialized = true;
}

export function t(key: string, lang: SupportedLanguage, options?: Record<string, unknown>): string {
  return i18n.t(key, { lng: lang, ...options });
}

export default i18n;
=======
import i18next from 'i18next';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export type SupportedLanguage = 'en' | 'ru' | 'ua';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadLocale(name: string): Record<string, string> {
  return JSON.parse(readFileSync(join(__dirname, 'locales', `${name}.json`), 'utf-8'));
}

const langMap: Record<string, SupportedLanguage> = {
  EN: 'en',
  RU: 'ru',
  UA: 'ua',
  en: 'en',
  ru: 'ru',
  ua: 'ua',
};

export function toI18nLang(dbLang: string): SupportedLanguage {
  return langMap[dbLang] ?? 'en';
}

export function toDbLang(i18nLang: SupportedLanguage): 'EN' | 'RU' | 'UA' {
  return i18nLang.toUpperCase() as 'EN' | 'RU' | 'UA';
}

const i18n = i18next.createInstance();

let initialized = false;

export async function initI18n(): Promise<void> {
  if (initialized) return;
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: loadLocale('en') },
      ru: { translation: loadLocale('ru') },
      ua: { translation: loadLocale('ua') },
    },
    interpolation: { escapeValue: false },
  });
  initialized = true;
}

export function t(key: string, lang: SupportedLanguage, options?: Record<string, unknown>): string {
  return i18n.t(key, { lng: lang, ...options });
}

export default i18n;
>>>>>>> 3fa0ac1 (upload project)
