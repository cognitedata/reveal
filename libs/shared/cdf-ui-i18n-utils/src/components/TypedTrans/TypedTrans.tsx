import React from 'react';
import { Trans, TransProps } from 'react-i18next';

export type TypedTransProps<T extends string> = {
  i18nKey: T;
} & Omit<TransProps<T>, 'i18nKey'>;

export const TypedTrans = <K extends string>(props: TypedTransProps<K>) => (
  // eslint-disable-next-line
  <Trans {...props} />
);
