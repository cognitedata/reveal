import { describe, expect, test } from 'vitest';
import {
  isEmpty,
  isTranslatedString,
  isUntranslatedString,
  type TranslationInput
} from './TranslateInput';

describe('TranslateInput', () => {
  test('Translated string should have correct type', () => {
    const input: TranslationInput = { key: 'BOX' };
    expect(isTranslatedString(input)).toBe(true);
    expect(isUntranslatedString(input)).toBe(false);
  });

  test('Untranslated string should have correct type', () => {
    const input: TranslationInput = { untranslated: 'Box' };
    expect(isTranslatedString(input)).toBe(false);
    expect(isUntranslatedString(input)).toBe(true);
  });

  test('Translation string should not be empty', () => {
    const input: TranslationInput = { key: 'BOX' };
    expect(isEmpty(input)).toBe(false);
  });

  test('Untranslated string should not be empty', () => {
    const input: TranslationInput = { untranslated: 'Box' };
    expect(isEmpty(input)).toBe(false);
  });

  test('Untranslated string should be empty', () => {
    const input: TranslationInput = { untranslated: '' };
    expect(isEmpty(input)).toBe(true);
  });
});
