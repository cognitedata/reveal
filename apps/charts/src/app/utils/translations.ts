import { pick } from 'lodash';

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

interface TranslationProperties<T extends string | symbol | number> {
  defaultTranslations: Record<T, string>;
  translationKeys: T[];
  translationNamespace: string;
}

export function translationKeys<
  TranslationKeys extends string | symbol | number
>(translations: Record<TranslationKeys, string>): TranslationKeys[] {
  return Object.keys(translations) as Array<keyof typeof translations>;
}

export function getTranslationsForComponent<
  ComponentTranslationKeys extends string | symbol | number,
  TranslationKeys extends ComponentTranslationKeys
>(
  componentTranslations: Record<ComponentTranslationKeys, string>,
  component: TranslationProperties<TranslationKeys>
): Record<TranslationKeys, string> {
  return pick(componentTranslations, component.translationKeys);
}
