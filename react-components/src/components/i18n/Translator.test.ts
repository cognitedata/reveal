/*!
 * Copyright 2023 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { type TranslationInput } from '../../architecture/base/utilities/TranslateInput';

import english from '../../common/i18n/en/reveal-react-components.json';
import { setCurrentLanguage, translate } from './Translator';

describe('Translator', () => {
  beforeEach(() => {});

  test('Should translate', () => {
    const actual = translate({ key: 'BOX' });
    expect(actual).toBe(english.BOX);
  });

  test('Should not translate', async () => {
    const input: TranslationInput = { untranslated: 'Hallo world' };
    const actual = translate(input);
    expect(actual).toBe(input.untranslated);
  });

  test('Change language to spanish', async () => {
    // Change the language to Spanish
    await setCurrentLanguage('es');

    // Translate
    const actual = translate({ key: 'BOX' });

    // Reset the language back to default
    await setCurrentLanguage('en');
    expect(actual).toBe('Cuadro');
  });

  test('Change language to not existing language', async () => {
    // Change language to Norwegian
    await setCurrentLanguage('no');

    // Translate
    const actual = translate({ key: 'BOX' });

    // Reset the language back to default
    await setCurrentLanguage('en');
    expect(actual).toBe('Box');
  });
});
