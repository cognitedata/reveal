/*!
 * Copyright 2024 Cognite AS
 */

import english from '../../../common/i18n/en/reveal-react-components.json';

export type TranslationKey = keyof typeof english;

export type TranslatedString = { key: TranslationKey };
export type UntranslatedString = { untranslated: string };

export type TranslationInput = TranslatedString | UntranslatedString;

export type TranslateDelegate = (key: TranslationInput) => string;

export function isTranslatedString(input: TranslationInput): input is TranslatedString {
  const key = (input as TranslatedString).key;
  return key !== undefined && key in english;
}

export function isUntranslatedString(input: TranslationInput): input is UntranslatedString {
  return (input as UntranslatedString).untranslated !== undefined;
}
