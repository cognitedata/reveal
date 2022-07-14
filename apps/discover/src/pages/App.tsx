import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { Provider as ReduxProvider } from 'react-redux';

import { Providers as DiscoverProviders } from 'providers';

import { ToastContainer } from '@cognite/cogs.js';
import {
  isTest,
  Container,
  getProjectInfo,
  storage,
} from '@cognite/react-container';

import { SIDECAR } from 'constants/app';
import ApplicationRoutes from 'core/routes';
import { configureStore } from 'core/store';
import { GlobalStyles } from 'styles/globalStyles';

import { DevelopmentHelpers } from '../components/DevelopmentHelpers';

if (isTest) {
  ReactModal.setAppElement('#root');
}

const APP_STATE_KEY = 'APP_STATE';

export const AppRoot: React.FC = () => {
  const [possibleTenant] = getProjectInfo();
  const [store] = useState(() =>
    configureStore({
      ...(storage.getItem(APP_STATE_KEY) || {}),
      environment: { tenant: possibleTenant, appName: SIDECAR.applicationId },
    })
  );

  const writeAppStateToStorage = () => {
    const appState = store.getState();
    const preserveAppState = false;

    if (preserveAppState) {
      storage.setItem(APP_STATE_KEY, appState);
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', writeAppStateToStorage);
    return () => {
      window.removeEventListener('beforeunload', writeAppStateToStorage);
    };
  }, []);

  // ReduxProvider should be moved to the react-container
  return (
    <ReduxProvider store={store}>
      <Container sidecar={SIDECAR}>
        <>
          <DevelopmentHelpers />
          <GlobalStyles />
          <ToastContainer />
          {/* eg: feature flags, query cache */}
          <DiscoverProviders>
            {/* eg: app main entry point */}
            <ApplicationRoutes project={possibleTenant} />
          </DiscoverProviders>
        </>
      </Container>
    </ReduxProvider>
  );
};

export default AppRoot;
