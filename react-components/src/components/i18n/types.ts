/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactNode } from 'react';

export type Translations = Record<string, Record<string, string>>;

export type I18nProps = {
  appLanguage?: string;
  children: ReactNode;
};

export type I18nContent = {
  currentLanguage: string;
  t: (key: string, fallback?: string) => string;
};
