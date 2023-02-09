import { useEffect } from 'react';
import { Outlet, ReactLocation, Router } from 'react-location';
import { useSelector } from 'react-redux';

import GlobalStyles from 'global-styles';
import { routes } from 'routes';
import styled from 'styled-components/macro';

import { Loader, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';

import { MenuBar } from 'components/Menubar';
import { useTitle } from 'hooks/useTitle';
import { useUserInfo } from 'hooks/useUserInfo';
import { appSlice } from 'store/app';
import { selectIsInitialized } from 'store/app/selectors';
import { useAppDispatch } from 'store/hooks';
import { simconfigApiPropertiesSlice } from 'store/simconfigApiProperties';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { identifyUser } from 'utils/metrics/tracking';
import sidecar from 'utils/sidecar';

import { enhanceSimconfigApiEndpoints } from './enhanceSimconfigApiEndpoints';

const location = new ReactLocation();

export default function App() {
  const dispatch = useAppDispatch();
  const client = useSDK();
  const { data: user } = useUserInfo();
  const isInitialized = useSelector(selectIsInitialized);
  const project = useSelector(selectProject);

  simconfigApiPropertiesSlice.actions.setProperties({
    baseUrl: sidecar.cdfApiBaseUrl,
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
        baseUrl: sidecar.cdfApiBaseUrl,
        project: client.project,
      })
    );

    dispatch(appSlice.actions.setIsInitialized(true));
  }, [user, client, project, dispatch]);

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
            <MenuBar />
            <Content>
              <ToastContainer />
              <Outlet />
            </Content>
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
