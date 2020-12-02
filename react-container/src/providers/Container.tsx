import React from 'react';
import { Router } from 'react-router-dom';
import { Store } from 'redux';

import { I18nContainer } from '@cognite/react-i18n';
import { ErrorBoundary } from '@cognite/react-errors';

import { createBrowserHistory } from '../internal';
import { storage, getTenantInfo } from '../utils';
import { ConditionalReduxProvider } from './ConditionalReduxProvider';

interface Props {
  appName: string;
  store?: Store;
  children: React.ReactChild;
}
export const Container: React.FC<Props> = ({
  children,
  store,
  appName,
}: Props) => {
  const [possibleTenant, initialTenant] = getTenantInfo(window.location);

  storage.init({ tenant: possibleTenant, appName });

  const [history] = React.useState(() => createBrowserHistory(possibleTenant));

  // this will only ever run locally
  // when deployed it will use the 'Tenant Selector' application
  if (!possibleTenant) {
    if (!initialTenant) {
      return (
        <div>
          Please enter the tenant name directly in the url for local dev.
        </div>
      );
    }

    history.push(`/${initialTenant}/`);
    document.location.reload();

    return <div>Loading...</div>;
  }

  return (
    <I18nContainer>
      <ConditionalReduxProvider store={store}>
        <ErrorBoundary instanceId="app-root">
          <Router history={history}>{children}</Router>
        </ErrorBoundary>
      </ConditionalReduxProvider>
    </I18nContainer>
  );
};
