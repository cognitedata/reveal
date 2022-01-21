import { useContext, useEffect } from 'react';
import { Outlet, ReactLocation, Router } from 'react-location';
import { useSelector } from 'react-redux';

import GlobalStyles from 'global-styles';
import { routes } from 'routes';
import styled from 'styled-components/macro';

import { Loader, ToastContainer } from '@cognite/cogs.js';

import { MenuBar } from 'components/Menubar';
import { useTitle } from 'hooks/useTitle';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { fetchGroups } from 'store/group/thunks';
import { useAppDispatch } from 'store/hooks';
import { selectIsAppInitialized } from 'store/selectors';
import { simconfigApiPropertiesSlice } from 'store/simconfigApiProperties';
import sidecar from 'utils/sidecar';

import { enhanceSimconfigApiEndpoints } from './enhanceSimconfigApiEndpoints';

export default function App() {
  const dispatch = useAppDispatch();
  const { cdfClient, authState } = useContext(CdfClientContext);
  const isAppInitialized = useSelector(selectIsAppInitialized);
  const project = authState?.project ?? '';

  enhanceSimconfigApiEndpoints();

  useEffect(() => {
    void dispatch(fetchGroups(cdfClient));

    dispatch(
      simconfigApiPropertiesSlice.actions.setBaseUrl(
        sidecar.simconfigApiBaseUrl
      )
    );
    dispatch(
      simconfigApiPropertiesSlice.actions.setAuthToken(authState?.token)
    );
    dispatch(simconfigApiPropertiesSlice.actions.setProject(project));
  }, [authState, cdfClient, dispatch, project]);

  if (!isAppInitialized) {
    return <Loader />;
  }

  const location = new ReactLocation();

  return (
    <>
      <GlobalStyles />
      <Router
        basepath={`/${project}`}
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
