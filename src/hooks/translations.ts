import { useTranslation } from 'react-i18next';
import { translationKeys } from 'utils/translations';

type TranslationKey = string | number | symbol;
/**
 * A custom hook function to fetch translation keys from Locize backend.
 * @param keys Array of string
 * @param [namespace] Locize namespace for grouping
 * @returns {Object} Object returned from Locize of given namespace
 */
export function useTranslations<TranslationKeys extends TranslationKey>(
  keys: TranslationKeys[],
  namespace = 'global'
): { t: Record<TranslationKeys, string>; translationReady: boolean } {
  const { t, ready } = useTranslation(namespace, { useSuspense: false });

  return {
    t: keys.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: ready ? t(String(curr)) : String(curr),
      }),
      {} as Record<TranslationKeys, string>
    ),
    translationReady: ready,
  };
}

interface TranslationProperties {
  defaultTranslations: Record<string | number | symbol, string>;
  translationNamespace: string;
}

export function useComponentTranslations(component: TranslationProperties) {
  if (!component.defaultTranslations) {
    throw new Error('Component has no defaultTranslations defined in it.');
  }
  if (!component.translationNamespace) {
    throw new Error('Component has no translationNamespace defined in it.');
  }
  return useTranslations(
    translationKeys(component.defaultTranslations),
    component.translationNamespace
  ).t;
}
