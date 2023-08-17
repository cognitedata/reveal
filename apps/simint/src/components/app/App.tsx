/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect } from 'react';
import { Outlet, ReactLocation, Router } from 'react-location';
import { useSelector } from 'react-redux';

import { AccessControlWrapper } from '@simint-app/components/accesscontrolwrapper';
import { MenuBar } from '@simint-app/components/Menubar';
import GlobalStyles from '@simint-app/global-styles';
import { useTitle } from '@simint-app/hooks/useTitle';
import { useUserInfo } from '@simint-app/hooks/useUserInfo';
import { routes } from '@simint-app/routes';
import { appSlice } from '@simint-app/store/app';
import { selectIsInitialized } from '@simint-app/store/app/selectors';
import { useAppDispatch } from '@simint-app/store/hooks';
import { simconfigApiPropertiesSlice } from '@simint-app/store/simconfigApiProperties';
import { selectProject } from '@simint-app/store/simconfigApiProperties/selectors';
import { identifyUser } from '@simint-app/utils/metrics/tracking';
import styled from 'styled-components/macro';

import { Loader, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';

import { BASIC_CAPABILITIES_REQUIRED } from './constants';
import { enhanceSimconfigApiEndpoints } from './enhanceSimconfigApiEndpoints';

const location = new ReactLocation();

export default function App() {
  const dispatch = useAppDispatch();
  const client = useSDK();
  const { data: user } = useUserInfo();
  const isInitialized = useSelector(selectIsInitialized);
  const project = useSelector(selectProject);

  const BASE_URL = process.env.NX_REACT_APP_LOCAL_SERVICE
    ? `https://localhost:8810`
    : client.getBaseUrl();

  simconfigApiPropertiesSlice.actions.setProperties({
    baseUrl: BASE_URL,
  });
  enhanceSimconfigApiEndpoints();

  useEffect(() => {
    if (!user) {
      return;
    }

    identifyUser({
      userId: user.mail || user.displayName || user.id,
      project,
      email: user.mail,
    });

    dispatch(appSlice.actions.setIsAuthenticated(true));

    dispatch(
      simconfigApiPropertiesSlice.actions.setProperties({
        authHeaders: client.getDefaultRequestHeaders(),
        baseUrl: BASE_URL,
        project: client.project,
      })
    );

    dispatch(appSlice.actions.setIsInitialized(true));
  }, [user, client, project, BASE_URL, dispatch]);

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <GlobalStyles />
      <Router
        basepath={`/${client.project}`}
        defaultPendingElement={<Loader />}
        defaultPendingMs={50}
        location={location}
        // fusion-migration
        // @ts-ignore
        routes={routes(dispatch, client.project)}
      >
        <FlagProvider
          apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
          appName="simconfig"
          projectName={project}
          disableMetrics
        >
          <RoutedAppContainer>
            <AccessControlWrapper
              requiredCapabilities={BASIC_CAPABILITIES_REQUIRED}
            >
              <MenuBar />
              <Content>
                <ToastContainer />
                <Outlet />
              </Content>
            </AccessControlWrapper>
          </RoutedAppContainer>
        </FlagProvider>
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
  height: 100%;
  flex-flow: column nowrap;
`;

const Content = styled.div`
  flex: 1 0 0;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
`;
