import { useTranslation } from 'react-i18next';
import { isDevelopment } from 'utils/environment';

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

interface TranslatableComponent {
  displayName?: string;
  translationKeys: TranslationKey[];
}

export function useComponentTranslations<
  ComponentType extends TranslatableComponent
>(component: ComponentType) {
  if (!component.displayName && isDevelopment) {
    // eslint-disable-next-line no-console
    console.warn(
      'Component has no displayName. Using the default namespace for i18n'
    );
  }
  if (!component.translationKeys) {
    throw new Error('Component has no translationKeys defined in it.');
  }
  const { t, ready } = useTranslation(component.displayName, {
    useSuspense: false,
  });
  return {
    t: component.translationKeys.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: ready ? t(String(curr)) : String(curr),
      }),
      {} as Record<keyof TranslatableComponent['translationKeys'], string>
    ),
    translationReady: ready,
  };
}
