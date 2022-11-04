import React from 'react';
import { i18n as reactI18N, WithT, TFunction, TOptions } from 'i18next';
import {
  useTranslation as useTranslationFromLibrary,
  i18next,
  Trans,
} from '@cognite/react-i18n';
import noop from 'lodash/noop';

export interface TransProps<E extends Element = HTMLDivElement>
  extends React.HTMLProps<E>,
    Partial<WithT> {
  children?: React.ReactNode;
  components?:
    | readonly React.ReactNode[]
    | { [tagName: string]: React.ReactNode };
  count?: number;
  defaults?: string;
  i18n?: reactI18N;
  i18nKey?: string;
  ns?: string;
  parent?: string | React.ComponentType<any> | null; // used in React.createElement if not null
  // eslint-disable-next-line @typescript-eslint/ban-types
  tOptions?: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  values?: {};
  t?: TFunction;
}

export type TFunctionWrapper = (
  key: string,
  referenceValue: string,
  options?: TOptions
) => string;

export type TComponentWrapper = (props: TransProps) => React.ReactElement;
const useTranslation = (namespace: string) => {
  // TODO(CM-2134) Add i18n initialization. See https://react.i18next.com/latest/using-with-hooks#configure-i18next
  // const { t, i18n } = useTranslationFromLibrary(namespace);
  const t = (key: string, options: any = {}) => {
    return options?.defaultValue;
  };
  const i18n = {
    changeLanguage: (_: string) => new Promise(noop),
  } as any;

  const availableLanguages = [{ name: 'English', code: 'en' }] as const;

  const TransWrapperComponent: TComponentWrapper = (props: TransProps) => (
    <Trans i18n={i18n} t={t} {...props} />
  );

  const changeLanguage = (code: string) => {
    localStorage.setItem('DT_APP_LANG', code);
    i18n.changeLanguage(code);
  };

  const tWrapper: TFunctionWrapper = (key, referenceValue, options = {}) =>
    t(key, { defaultValue: referenceValue, ...options });

  return {
    t: tWrapper,
    availableLanguages,
    currentLanguage: availableLanguages.find(
      (lang) => lang.code === i18n.language
    ),
    changeLanguage,
    Trans: TransWrapperComponent,
  };
};

export default useTranslation;
