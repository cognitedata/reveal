import React from 'react';
import { configureI18n } from '@cognite/react-i18n';
import { SidecarConfig } from '@cognite/react-tenant-selector';

/*
 * This is a separate wrapper because we want to limit where we use the i18n setup
 *
 * the trick is when running on localhost
 * it will use the TenantSelector
 * which is it's own Locize project
 * so it needs to initialize i18n it's self (with it's own locize project id, eg: tenant-selector)
 *
 * but the rest of the app needs to use that app's locize project, eg: demo-app
 *
 *
 */
export const TranslationWrapper: React.FC<SidecarConfig> = ({
  children,
  disableTranslations,
  locize,
}) => {
  configureI18n({
    disabled: disableTranslations,
    locize,
    keySeparator: locize?.keySeparator,
  });

  return <>{children}</>;
};
