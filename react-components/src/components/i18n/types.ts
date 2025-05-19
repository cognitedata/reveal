/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactNode } from 'react';
import { type TranslationInput } from '../../architecture';

export type I18nProps = {
  appLanguage?: string;
  children: ReactNode;
};

export type I18nContent = {
  currentLanguage: string;
  t: (translationInput: TranslationInput) => string;
};
