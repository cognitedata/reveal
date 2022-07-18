import React from 'react';
import { configureI18n, ConfigureI18nOptions } from '@cognite/react-i18n';
import { SidecarConfig } from '@cognite/sidecar';

export const TranslationWrapper: React.FC<
  React.PropsWithChildren<
    SidecarConfig & { i18nOptions?: ConfigureI18nOptions }
  >
> = ({ children, disableTranslations, locize, ...i18nOptions }) => {
  configureI18n({
    ...i18nOptions,
    disabled: disableTranslations,
    locize,
    keySeparator: locize?.keySeparator,
  });

  return <>{children}</>;
};
