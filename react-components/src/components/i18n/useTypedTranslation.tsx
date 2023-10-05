/*!
 * Copyright 2023 Cognite AS
 */
import { useCallback } from 'react';

import { type TOptions } from 'i18next';
import {
  type UseTranslationOptions,
  useTranslation,
  type UseTranslationResponse
} from 'react-i18next';
import { type ExtendedTranslationKeys } from './types';

export type StringMap = Record<string, any>;
export type TFunction<K extends string> = (
  key: ExtendedTranslationKeys<K>,
  options?: TOptions<StringMap> | string
) => string;

export const useTypedTranslation = <K extends string>(
  ns?: string,
  options?: UseTranslationOptions<undefined>
): UseTranslationResponse<string, undefined> => {
  const { t: oldT, ...rest } = useTranslation(ns, options);

  const t = useCallback(
    (key: ExtendedTranslationKeys<K>, options?: TOptions<StringMap> | string) => {
      const translation = oldT(key, options);
      return translation;
    },
    [oldT]
  );

  return { t, ...rest };
};
