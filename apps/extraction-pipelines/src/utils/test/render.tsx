import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'utils/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SelectedIntegrationProvider } from '../../hooks/useSelectedIntegration';
import { AppEnvProvider } from '../../hooks/useAppEnv';
import { IntegrationProvider } from '../../hooks/details/IntegrationContext';
import { Integration } from '../../model/Integration';
import { INTEGRATIONS } from '../baseURL';

export default (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const component = <div className={styleScope}>{ui}</div>;

  return render(component, options);
};

export const renderWithSelectedIntegrationContext = (
  ui: React.ReactNode,
  // @ts-ignore
  { initIntegration, client, route = INTEGRATIONS, ...renderOptions }
) => {
  const history = createMemoryHistory();
  history.push(route);
  return render(
    <QueryClientProvider client={client}>
      <Router history={history}>
        <SelectedIntegrationProvider initIntegration={initIntegration}>
          {ui}
        </SelectedIntegrationProvider>
      </Router>
    </QueryClientProvider>,
    renderOptions
  );
};
export const renderWithReactQueryCacheProvider = (
  client: QueryClient,
  project: string,
  cdfEnv: string,
  origin: string
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={client}>
        <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
          {children}
        </AppEnvProvider>
      </QueryClientProvider>
    );
  };
  return wrapper;
};

export const renderQueryCacheIntegration = (
  client: QueryClient,
  project: string,
  cdfEnv: string,
  origin: string,
  integration: Integration
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
        <IntegrationProvider initIntegration={integration}>
          {children}
        </IntegrationProvider>
      </AppEnvProvider>
    </QueryClientProvider>
  );
  return wrapper;
};

export const renderWithReQueryCacheSelectedIntegrationContext = (
  client: QueryClient,
  project: string,
  cdfEnv: string,
  origin: string,
  initIntegration?: Integration,
  route: string = INTEGRATIONS
) => {
  const history = createMemoryHistory();
  history.push(route);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
        <Router history={history}>
          <SelectedIntegrationProvider initIntegration={initIntegration}>
            {children}
          </SelectedIntegrationProvider>
        </Router>
      </AppEnvProvider>
    </QueryClientProvider>
  );
  return wrapper;
};

export const renderWithQueryClient = (client: QueryClient) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return wrapper;
};
