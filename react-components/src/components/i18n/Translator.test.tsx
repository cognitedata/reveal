/*!
 * Copyright 2023 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { type TranslationInput } from '../../architecture/base/utilities/TranslateInput';

import english from '../../common/i18n/en/reveal-react-components.json';
import { Translator } from './Translator';

describe(Translator.name, () => {
  beforeEach(() => {});

  test('Should translate', () => {
    const input: TranslationInput = { key: 'BOX' };
    const actual = Translator.instance.translate(input);
    expect(actual).toBe(english.BOX);
  });

  test('Should not translate', () => {
    const input: TranslationInput = { untranslated: 'Hallo world' };
    const actual = Translator.instance.translate(input);
    expect(actual).toBe(input.untranslated);
  });

  test('Change language', async () => {
    // Pretend to change the language to Spanish
    const getCurrentLanguage = Translator.instance.getCurrentLanguage;
    Translator.instance.getCurrentLanguage = () => {
      return 'es';
    };
    Translator.instance.onLanguageChange();

    // Translate
    const input: TranslationInput = { key: 'BOX' };
    const actual = Translator.instance.translate(input);

    // Reset the language back to default
    Translator.instance.getCurrentLanguage = getCurrentLanguage;
    expect(actual).toBe('Cuadro');
  });
});
