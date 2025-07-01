import { getLanguage } from '../../../components/i18n/utils';
import {
  type TranslationInput,
  isTranslatedString,
  type TranslationKey,
  type Translations
} from './TranslateInput';

import englishTranslation from '../../../common/i18n/en/reveal-react-components.json';

const ENGLISH_LANGUAGE = 'en';
let currentLanguage: string = ENGLISH_LANGUAGE;
let currentTranslation: Translations = englishTranslation;

void initialize();

export function translate(input: TranslationInput): string {
  if (isTranslatedString(input)) {
    return translateByKey(input.key);
  }
  return input.untranslated;
}

export async function setCurrentLanguage(newLanguage: string | undefined): Promise<void> {
  if (newLanguage === ENGLISH_LANGUAGE && currentTranslation === englishTranslation) {
    currentLanguage = newLanguage;
    return; // Already done
  }
  if (newLanguage === undefined || newLanguage === currentLanguage) {
    return; // No or illegal change
  }
  try {
    currentTranslation = await loadTranslationFile(newLanguage);
    currentLanguage = newLanguage;
  } catch (error) {
    console.warn('Error loading translation file');
  }
}

async function initialize(): Promise<void> {
  const onLanguageChange = async (): Promise<void> => {
    await setCurrentLanguage(getLanguage());
  };

  window.addEventListener('languagechange', onLanguageChange);
  await onLanguageChange();
}

function translateByKey(key: TranslationKey): string {
  if (currentTranslation !== undefined && currentTranslation[key] !== undefined) {
    return currentTranslation[key];
  }
  return englishTranslation[key];
}

async function loadTranslationFile(language: string): Promise<Translations> {
  const result = await import(`../../../common/i18n/${language}/reveal-react-components.json`);
  const translationModule = result as { default: Translations };
  return translationModule.default;
}
