import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { Provider as ReduxProvider } from 'react-redux';

import { Providers as DiscoverProviders } from 'providers';

import { isTest, Container, getTenantInfo } from '@cognite/react-container';
import { SidecarConfig } from '@cognite/sidecar';

import { SIDECAR } from 'constants/app';
import ApplicationRoutes from 'core/routes';
import { configureStore } from 'core/store';
import { GlobalStyles } from 'styles/globalStyles';

if (isTest) {
  ReactModal.setAppElement('#root');
}

export const AppRoot: React.FC = () => {
  const [possibleTenant] = getTenantInfo();
  const [store] = useState(() =>
    configureStore({
      environment: { tenant: possibleTenant, appName: SIDECAR.applicationId },
    })
  );

  // ReduxProvider should be moved to the react-container
  return (
    <ReduxProvider store={store}>
      <Container sidecar={SIDECAR as SidecarConfig}>
        <>
          <GlobalStyles />
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
