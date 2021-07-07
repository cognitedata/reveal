import { useMemo, useEffect } from 'react';
import { useLink, usePossibleTenant } from 'hooks';
import {
  createBrowserHistory as createNewBrowserHistory,
  History,
} from 'history';
import { Container } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import Authentication from './Authentication';
import AppProviders from './AppProviders';
import ErrorBoundary from './ErrorBoundary';

export const createBrowserHistory = (possibleTenant: string): History =>
  createNewBrowserHistory({
    basename: possibleTenant,
  });

const AppRoot = (): JSX.Element => {
  const tenant = usePossibleTenant();
  const { documentTitle } = useLink();
  const history = useMemo(() => createBrowserHistory(tenant), [tenant]);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

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

export default AppRoot;
