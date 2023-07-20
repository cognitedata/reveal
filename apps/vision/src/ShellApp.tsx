import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import { LazyWrapper } from '@vision/modules/Common/Components/LazyWrapper';
import NoAccessPage from '@vision/pages/NoAccessPage';
import NotFound from '@vision/pages/NotFound';
import store from '@vision/store';
import AntStyles from '@vision/styles/AntStyles';
import GlobalStyles from '@vision/styles/global-styles';
import theme from '@vision/styles/theme';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';

import { Loader } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import { DataExplorationWrapper } from './DataExplorationWrapper';
import { useUserCapabilities } from './hooks/useUserCapabilities';
import rootStyles from './styles/index.css';

const App = () => {
  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    datePickerStyle.use(); // Needed to render date filer correctly

    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      datePickerStyle.unuse();
    };
  }, []);
  return (
    <AntStyles>
      <ThemeProvider theme={theme}>
        <ReduxProvider store={store}>
          <DataExplorationWrapper>
            <AppRoutes />
          </DataExplorationWrapper>
        </ReduxProvider>
      </ThemeProvider>
      <GlobalStyles theme={theme} />
    </AntStyles>
  );
};

export default App;

const RouteWrapper: React.FC<{
  capabilities: { acl: string; actions: string[] }[];
  children: JSX.Element;
}> = ({ capabilities, children }): JSX.Element => {
  const { data: hasCapabilities, isFetched } =
    useUserCapabilities(capabilities);
  const { pathname } = useLocation();

  if (!isFetched) {
    return <Loader />;
  }

  if (!hasCapabilities) {
    return (
      <NoAccessPage capabilities={capabilities} requestedPathName={pathname} />
    );
  }

  return <>{children}</>;
};

const routes = [
  {
    path: '/',
    importFn: () => import('@vision/pages/Home'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
    ],
  },
  {
    path: '/workflow/review/:fileId',
    importFn: () => import('@vision/modules/Review/Containers/Review'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
    ],
  },
  {
    path: '/workflow/*',
    importFn: () => import('@vision/pages/Process'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
      {
        acl: 'annotationsAcl',
        actions: ['WRITE'],
      },
    ],
  },
  {
    path: '/explore',
    importFn: () => import('@vision/modules/Explorer/Containers/Explorer'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
    ],
  },
  {
    path: '/models',
    importFn: () => import('@vision/modules/AutoML/Components/AutoML'),
    capabilities: [
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
      {
        acl: 'visionModelAcl',
        actions: ['READ'],
      },
    ],
  },
];

export function AppRoutes() {
  return (
    <Routes>
      {routes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={
            <RouteWrapper capabilities={r.capabilities}>
              <LazyWrapper importFn={r.importFn} />
            </RouteWrapper>
          }
        />
      ))}

      <Route element={<NotFound />} />
    </Routes>
  );
}
