import en from '@transformations/common/i18n/translations/en/transformations.json';

import {
  useTypedTranslation,
  TypedTrans,
  TypedTransProps,
} from '@cognite/cdf-i18n-utils';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { transformations: en },
};

export const useTranslation = () =>
  useTypedTranslation<TranslationKeys>('transformations');

export const Trans = (props: TypedTransProps<TranslationKeys>) => (
  <TypedTrans<TranslationKeys> {...props} />
);
