import {
  TypedTrans,
  TypedTransProps,
  useTypedTranslation,
} from '@cognite/cdf-i18n-utils';

import en from 'common/i18n/translations/en/extractor-downloads.json';

export const translations = {
  en: { 'extractor-downloads': en },
};

export type TranslationKeys = keyof typeof en;

export const Trans = (props: TypedTransProps<TranslationKeys>) => (
  <TypedTrans<TranslationKeys> {...props} />
);

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
