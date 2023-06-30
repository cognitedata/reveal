import {
  TypedTrans,
  TypedTransProps,
  useTypedTranslation,
} from '@cognite/cdf-i18n-utils';

import de from './de/business-shell.json';
import en from './en/business-shell.json';
import es from './es/business-shell.json';
import fr from './fr/business-shell.json';
import it from './it/business-shell.json';
import ja from './ja/business-shell.json';
import ko from './ko/business-shell.json';
import nl from './nl/business-shell.json';
import pt from './pt/business-shell.json';
import sv from './sv/business-shell.json';
import zh from './zh/business-shell.json';

export const translations = {
  de: { 'business-shell': de },
  en: { 'business-shell': en },
  es: { 'business-shell': es },
  fr: { 'business-shell': fr },
  it: { 'business-shell': it },
  ja: { 'business-shell': ja },
  ko: { 'business-shell': ko },
  nl: { 'business-shell': nl },
  pt: { 'business-shell': pt },
  sv: { 'business-shell': sv },
  zh: { 'business-shell': zh },
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();

export const Trans = (props: TypedTransProps<TranslationKeys>) => (
  <TypedTrans<TranslationKeys> {...props} />
);
