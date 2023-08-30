import { LANGUAGES } from '../../common/constants';

export const getLanguageLabel = (lang: string) =>
  LANGUAGES.find((language) => language.code === lang)?.label || undefined;
