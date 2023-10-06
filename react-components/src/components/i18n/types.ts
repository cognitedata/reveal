/*!
 * Copyright 2023 Cognite AS
 */
export type Translations = Record<string, Record<string, string>>;

export type I18nContent = {
  currentLanguage: string;
  t: (key: string, fallback?: string) => string;
};
