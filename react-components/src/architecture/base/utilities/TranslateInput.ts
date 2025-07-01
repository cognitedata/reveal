import english from '../../../common/i18n/en/reveal-react-components.json';

export type Translations = Record<string, string>;
export type TranslationKey = keyof typeof english;

export type TranslatedString = { key: TranslationKey };
export type UntranslatedString = { untranslated: string };

export type TranslationInput = TranslatedString | UntranslatedString;

export function isEmpty(input: TranslationInput | undefined): boolean {
  if (input === undefined) {
    return true;
  }
  if (isTranslatedString(input)) {
    return false;
  }
  return input.untranslated === '';
}

export type TranslateDelegate = (input: TranslationInput) => string;

export function isTranslatedString(input: TranslationInput): input is TranslatedString {
  const key = (input as TranslatedString).key;
  return key !== undefined && key in english;
}

export function isUntranslatedString(input: TranslationInput): input is UntranslatedString {
  return (input as UntranslatedString).untranslated !== undefined;
}
