import { useMemo } from 'react';
import { usePossibleTenant } from 'hooks';
import {
  createBrowserHistory as createNewBrowserHistory,
  History,
} from 'history';
import { Container } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import Authentication from './Authentication';
import AppProviders from './AppProviders';
import ErrorBoundary from './ErrorBoundary';

const AppRoot = (): JSX.Element => {
  const tenant = usePossibleTenant();

  const history = useMemo(() => createBrowserHistory(tenant), [tenant]);

  return (
    <Container sidecar={sidecar}>
      <AppProviders history={history} tenant={tenant}>
        <ErrorBoundary>
          <Authentication />
        </ErrorBoundary>
      </AppProviders>
    </Container>
  );
};

const createBrowserHistory = (possibleTenant: string): History =>
  createNewBrowserHistory({
    basename: possibleTenant,
  });

export default AppRoot;
