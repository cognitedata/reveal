import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from './translations/en/navigation.json';
import es from './translations/es/navigation.json';
import fr from './translations/fr/navigation.json';
import it from './translations/it/navigation.json';
import ja from './translations/ja/navigation.json';
import ko from './translations/ko/navigation.json';
import nl from './translations/nl/navigation.json';
import pt from './translations/pt/navigation.json';
import sv from './translations/sv/navigation.json';
import zh from './translations/zh/navigation.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { navigation: en },
  es: { navigation: es },
  fr: { navigation: fr },
  it: { navigation: it },
  ja: { navigation: ja },
  ko: { navigation: ko },
  nl: { navigation: nl },
  pt: { navigation: pt },
  sv: { navigation: sv },
  zh: { navigation: zh },
};

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
