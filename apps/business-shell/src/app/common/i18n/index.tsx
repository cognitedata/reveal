import {
  TypedTrans,
  TypedTransProps,
  useTypedTranslation,
} from '@cognite/cdf-i18n-utils';

import en from './en/business-shell.json';
import ja from './ja/business-shell.json';

export const translations = {
  en: { 'business-shell': en },
  ja: { 'business-shell': ja },
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();

export const Trans = (props: TypedTransProps<TranslationKeys>) => (
  <TypedTrans<TranslationKeys> {...props} />
);
