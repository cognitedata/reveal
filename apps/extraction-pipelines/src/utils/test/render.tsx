import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'utils/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SelectedIntegrationProvider } from '../../hooks/useSelectedIntegration';
import { AppEnvProvider } from '../../hooks/useAppEnv';
import { IntegrationProvider } from '../../hooks/details/IntegrationContext';
import { Integration } from '../../model/Integration';

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
  { initIntegration, client, ...renderOptions }
) => {
  return render(
    <QueryClientProvider client={client}>
      <SelectedIntegrationProvider initIntegration={initIntegration}>
        {ui}
      </SelectedIntegrationProvider>
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
  initIntegration?: Integration
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
        <SelectedIntegrationProvider initIntegration={initIntegration}>
          {children}
        </SelectedIntegrationProvider>
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
