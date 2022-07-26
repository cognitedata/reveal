import {
  TypedTrans,
  TypedTransProps,
  useTypedTranslation,
} from '@cognite/cdf-i18n-utils';

import en from 'common/i18n/translations/en/raw-explorer.json';

export const translations = {
  en: { 'raw-explorer': en },
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();

export const Trans = (props: TypedTransProps<TranslationKeys>) => {
  const { t } = useTranslation();
  return <TypedTrans<TranslationKeys> t={t} {...props} />;
};
