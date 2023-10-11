import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';

import { Loader } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import { DataExplorationWrapper } from './DataExplorationWrapper';
import { useUserCapabilities } from './hooks/useUserCapabilities';
import { LazyWrapper } from './modules/Common/Components/LazyWrapper';
import NoAccessPage from './pages/NoAccessPage';
import NotFound from './pages/NotFound';
import store from './store';
import AntStyles from './styles/AntStyles';
import GlobalStyles from './styles/global-styles';
import rootStyles from './styles/index.css';
import theme from './styles/theme';

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
    importFn: () => import('./pages/Home'),
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
    importFn: () => import('./modules/Review/Containers/Review'),
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
    importFn: () => import('./pages/Process'),
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
    importFn: () => import('./modules/Explorer/Containers/Explorer'),
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
