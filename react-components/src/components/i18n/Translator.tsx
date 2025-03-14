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

export function translate(input: TranslationInput): string {
  return Translator.instance.translate(input);
}

export class Translator {
  private static _instance?: Translator;
  private _language: string;
  private _translation?: Translations;

  private constructor() {
    this._language = getLanguage() ?? 'en';
    this.loadTranslationFile();
    window.addEventListener('languagechange', this.onLanguageChange);
    // Since this is a singleton, we don't need to removeEventListener this listener
  }

  public static get instance(): Translator {
    if (Translator._instance === undefined) {
      Translator._instance = new Translator();
    }
    return Translator._instance;
  }

  public translateByKey(key: TranslationKey): string {
    if (this._translation !== undefined) {
      if (this._translation[key] !== undefined) {
        return this._translation[key];
      }
    }
    return english[key];
  }

  public translate(input: TranslationInput): string {
    if (isTranslatedString(input)) {
      return this.translateByKey(input.key);
    }
    return input.untranslated;
  }

  onLanguageChange = (): void => {
    const newLanguage = getLanguage();
    if (newLanguage !== undefined && newLanguage !== this._language) {
      this._language = newLanguage;
      this.loadTranslationFile();
    }
  };

  private loadTranslationFile(): void {
    this._translation = undefined;
    const load = async (): Promise<void> => {
      try {
        const translationModule = (await import(
          `../../common/i18n/${this._language}/reveal-react-components.json`
        )) as { default: Translations };
        this._translation = translationModule.default;
      } catch (error) {
        console.warn('Error loading translation file. Default language: English is loaded');
      }
    };
    load().catch(() => {
      console.warn('Translation not found. Default language: English is loaded');
    });
  }
}
