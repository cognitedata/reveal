/*!
 * Copyright 2023 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { type TranslationInput } from './TranslateInput';

import english from '../../../common/i18n/en/reveal-react-components.json';
import { setCurrentLanguage, translate } from './translateUtils';
import { getLanguage } from '../../../components/i18n/utils';

describe('translateUtils', () => {
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

  test('Should handle browser language change event', async () => {
    const originalLanguage = getLanguage();

    // Mock navigator.language
    Object.defineProperty(navigator, 'language', {
      value: 'de',
      configurable: true
    });

    // Simulate languagechange event
    const languageChangeEvent = new Event('languagechange');
    window.dispatchEvent(languageChangeEvent);

    // Explicitly update the current language to match the mocked navigator.language
    await setCurrentLanguage(getLanguage());

    // Verify translation after language change
    const actual = translate({ key: 'BOX' });
    expect(actual).toBe('Kasten');

    // Restore original language
    Object.defineProperty(navigator, 'language', {
      value: originalLanguage,
      configurable: true
    });
    await setCurrentLanguage(originalLanguage); // Reset the language back to default
  });
});
