import {
  TypedTrans,
  TypedTransProps,
  useTypedTranslation,
} from '@cognite/cdf-i18n-utils';

import en from './translations/en/cdf-integrations-ui.json';

export const translations = {
  en: { 'cdf-integrations-ui': en },
};

export type TranslationKeys = keyof typeof en;

export const Trans = (props: TypedTransProps<TranslationKeys>) => (
  <TypedTrans<TranslationKeys> {...props} />
);

export const useTranslation = () =>
  useTypedTranslation<TranslationKeys>('cdf-integrations-ui');
