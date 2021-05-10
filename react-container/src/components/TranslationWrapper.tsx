import React from 'react';
import { configureI18n, ConfigureI18nOptions } from '@cognite/react-i18n';

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
export const TranslationWrapper: React.FC<ConfigureI18nOptions> = ({
  children,
  ...rest
}) => {
  configureI18n({
    useSuspense: true,
    wait: false,
    ...rest,
  });

  return <>{children}</>;
};
