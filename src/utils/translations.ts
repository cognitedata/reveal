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
