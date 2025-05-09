/*!
 * Copyright 2023 Cognite AS
 */

import { type Translations } from './types';
import { getLanguage } from './utils';
import {
  type TranslationInput,
  isTranslatedString,
  type TranslationKey
} from '../../architecture/base/utilities/TranslateInput';

import english from '../../common/i18n/en/reveal-react-components.json';

const ENGLISH_LANGUAGE = 'en';
let currentLanguage: string = getLanguage() ?? ENGLISH_LANGUAGE;
let translation: Translations = english;

initialize();

export function translate(input: TranslationInput): string {
  if (isTranslatedString(input)) {
    return translateByKey(input.key);
  }
  return input.untranslated;
}

export async function setCurrentLanguage(newLanguage: string | undefined): Promise<void> {
  if (newLanguage === undefined || newLanguage === currentLanguage) {
    return;
  }
  try {
    translation = await loadTranslationFile(newLanguage);
    currentLanguage = newLanguage;
  } catch (error) {
    console.warn('Error loading translation file');
  }
}

function initialize(): void {
  const onLanguageChange = async (): Promise<void> => {
    await setCurrentLanguage(getLanguage());
  };

  window.addEventListener('languagechange', onLanguageChange);
  if (translation === english && currentLanguage === ENGLISH_LANGUAGE) {
    return; // Already done
  }
  loadTranslationFile(currentLanguage)
    .then((t) => {
      translation = t;
    })
    .catch(() => {
      console.warn('Error loading translation file. English will be used');
      currentLanguage = ENGLISH_LANGUAGE;
      translation = english;
    });
}

function translateByKey(key: TranslationKey): string {
  if (translation !== undefined && translation[key] !== undefined) {
    return translation[key];
  }
  return english[key];
}

async function loadTranslationFile(language: string): Promise<Translations> {
  const filename = `../../common/i18n/${language}/reveal-react-components.json`;
  const result = await import(filename);
  const translationModule = result as { default: Translations };
  return translationModule.default;
}
