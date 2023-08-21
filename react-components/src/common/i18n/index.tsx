/*!
 * Copyright 2023 Cognite AS
 */
import { TypedTrans, type TypedTransProps, useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from './en/reveal-react-components.json';
import { type ReactElement } from 'react';

export const translations = {
  en: { 'reveal-react-components.json': en }
};

export type TranslationKeys = keyof typeof en;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useTranslation = () => useTypedTranslation<TranslationKeys>();

export const Trans = (props: TypedTransProps<TranslationKeys>): ReactElement => (
  <TypedTrans<TranslationKeys> {...props} />
);
