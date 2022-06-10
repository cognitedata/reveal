import { pick } from 'lodash';
import { FunctionComponent } from 'react';

/**
 * A helper function to create { key: key } object of same value as key name.
 * @param args Comma delimited strings, not an array though
 * @returns {Object} Newly created an object of given keys
 */
export function makeDefaultTranslations<
  TranslationKeys extends string | symbol | number
>(...args: TranslationKeys[]): Record<TranslationKeys, string> {
  return args.reduce(
    (prev, curr) => ({ ...prev, [curr]: String(curr) }),
    {} as Record<TranslationKeys, string>
  );
}

export interface FunctionComponentWithTranslationKeys<T = {}>
  extends FunctionComponent<T> {
  translationKeys: string[];
}

export function translationKeys<
  TranslationKeys extends string | symbol | number
>(translations: Record<TranslationKeys, string>): TranslationKeys[] {
  return Object.keys(translations) as Array<keyof typeof translations>;
}

export function getTranslationsFromComponent<
  ComponentTranslationKeys extends string | symbol | number,
  TranslationKeys extends ComponentTranslationKeys
>(
  componentTranslations: Record<ComponentTranslationKeys, string>,
  translations: Record<TranslationKeys, string>
): Record<TranslationKeys, string> {
  return pick(componentTranslations, translationKeys(translations));
}
