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
    await setCurrentLanguage('es');

    const actual = translate({ key: 'BOX' });

    await setCurrentLanguage('en'); // Reset the language back to default
    expect(actual).toBe('Cuadro');
  });

  test('Change language to spanish twice', async () => {
    await setCurrentLanguage('es');
    await setCurrentLanguage('es');

    const actual = translate({ key: 'BOX' });

    await setCurrentLanguage('en'); // Reset the language back to default
    expect(actual).toBe('Cuadro');
  });

  test('Change language to not existing language', async () => {
    await setCurrentLanguage('no'); // Change language to Norwegian

    const actual = translate({ key: 'BOX' });

    expect(actual).toBe('Box'); // Reset the language back to default
  });

  test('Change language to undefined', async () => {
    await setCurrentLanguage(undefined);

    const actual = translate({ key: 'BOX' });

    expect(actual).toBe('Box'); // Reset the language back to default
  });
});
