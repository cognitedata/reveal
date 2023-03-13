import {
  useTypedTranslation,
  TypedTrans,
  TypedTransProps,
} from '@cognite/cdf-i18n-utils';

import en from 'common/i18n/translations/en/entity-matching.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { 'entity-matching': en },
};
export const languages = Object.keys(translations);

export const useTranslation = () => useTypedTranslation<TranslationKeys>();

// export const Trans = (props: TypedTransProps<TranslationKeys>) => (
//   <TypedTrans<TranslationKeys> {...props} />
// );
