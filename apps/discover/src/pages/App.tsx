import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { Provider as ReduxProvider } from 'react-redux';

import { Providers as DiscoverProviders } from 'providers';

import { isTest, Container, getTenantInfo } from '@cognite/react-container';
import { SidecarConfig } from '@cognite/sidecar';

import { SIDECAR } from 'constants/app';
import ApplicationRoutes from 'core/routes';
import { configureStore } from 'core/store';
import { GlobalStyles } from 'styles/globalStyles';

import { DevelopmentHelpers } from '../components/DevelopmentHelpers';

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
  const [sidecar, setSidecar] = useState(SIDECAR);

  // overwrite fakeIdp user for e2e tests
  useEffect(() => {
    if (
      !process.env.REACT_APP_E2E_USER &&
      sidecar.fakeIdp &&
      sidecar.fakeIdp.length
    ) {
      fetch(`/uuid`)
        .then((res) => res.json())
        .then((res) => {
          setSidecar((prevState) => ({
            ...prevState,
            fakeIdp: prevState.fakeIdp
              ? prevState.fakeIdp.map((fakeIdp) => {
                  const isAdmin = fakeIdp.name?.toLowerCase().includes('admin');
                  return {
                    ...fakeIdp,
                    userId: (isAdmin ? 'admin-' : '') + res,
                  };
                })
              : prevState.fakeIdp,
          }));
        })
        .catch(() => {
          console.warn('UUID endpoint not accessible');
        });
    }
  }, []);

  // ReduxProvider should be moved to the react-container
  return (
    <ReduxProvider store={store}>
      <Container sidecar={sidecar as SidecarConfig}>
        <>
          <DevelopmentHelpers />
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
