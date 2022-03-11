import { useEffect } from 'react';
import { Outlet, ReactLocation, Router } from 'react-location';
import { useSelector } from 'react-redux';

import GlobalStyles from 'global-styles';
import { routes } from 'routes';
import styled from 'styled-components/macro';

import { Loader, ToastContainer } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';

import { MenuBar } from 'components/Menubar';
import { useTitle } from 'hooks/useTitle';
import { appSlice } from 'store/app';
import {
  selectIsAuthenticated,
  selectIsInitialized,
} from 'store/app/selectors';
import { useAppDispatch } from 'store/hooks';
import { simconfigApiPropertiesSlice } from 'store/simconfigApiProperties';
import { identifyUser } from 'utils/metrics/tracking';
import sidecar from 'utils/sidecar';

import { enhanceSimconfigApiEndpoints } from './enhanceSimconfigApiEndpoints';

export default function App() {
  const dispatch = useAppDispatch();
  const { client, authState, reauthenticate } = useAuthContext();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  simconfigApiPropertiesSlice.actions.setProperties({
    baseUrl: sidecar.simconfigApiBaseUrl,
  });
  enhanceSimconfigApiEndpoints();

  useEffect(() => {
    if (!client || !authState?.authenticated) {
      return;
    }

    identifyUser(authState.email);

    dispatch(appSlice.actions.setIsAuthenticated(true));

    dispatch(
      simconfigApiPropertiesSlice.actions.setProperties({
        authHeaders: client.getDefaultRequestHeaders(),
        baseUrl: sidecar.simconfigApiBaseUrl,
        project: client.project,
      })
    );

    dispatch(appSlice.actions.setIsInitialized(true));
  }, [authState, client, dispatch]);

  if (!client || !isInitialized) {
    return null;
  }

  if (!isAuthenticated && reauthenticate) {
    const handleReauth = () => {
      try {
        reauthenticate();
      } catch (e) {
        console.error('Re-authentication failed:', e);
        window.location.href = '/';
      }
    };
    handleReauth();
    return null;
  }

  const location = new ReactLocation();

  return (
    <>
      <GlobalStyles />
      <Router
        basepath={`/${client.project}`}
        defaultPendingElement={<Loader />}
        defaultPendingMs={50}
        location={location}
        routes={routes(dispatch)}
      >
        <RoutedAppContainer>
          <MenuBar />
          <Content>
            <ToastContainer />
            <Outlet />
          </Content>
        </RoutedAppContainer>
      </Router>
    </>
  );
}

function RoutedApp({
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<unknown>>) {
  useTitle();
  return <div {...props}>{children}</div>;
}

const RoutedAppContainer = styled(RoutedApp)`
  display: flex;
  height: 100vh;
  flex-flow: column nowrap;
`;

const Content = styled.div`
  flex: 1 0 0;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
`;
