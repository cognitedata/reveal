import React, { FunctionComponent, PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'utils/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { useForm, FormProvider } from 'react-hook-form';
import { SelectedIntegrationProvider } from 'hooks/useSelectedIntegration';
import { AppEnvProvider } from 'hooks/useAppEnv';
import { Integration, RegisterIntegrationInfo } from 'model/Integration';
import { RegisterIntegrationProvider } from 'hooks/useStoredRegisterIntegration';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import {
  RunFilterProvider,
  RunFilterProviderProps,
} from 'hooks/runs/RunsFilterContext';

export default (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const component = <div className={styleScope}>{ui}</div>;

  return render(component, options);
};

export const renderWithRouter = (
  ui: React.ReactNode,
  { route = EXTRACTION_PIPELINES_PATH, ...renderOptions }
) => {
  const history = createMemoryHistory();
  history.push(route);
  return render(<Router history={history}>{ui}</Router>, renderOptions);
};

export const renderWithSelectedIntegrationContext = (
  ui: React.ReactNode,
  {
    initIntegration,
    client,
    route = EXTRACTION_PIPELINES_PATH,
    ...renderOptions
  }: { initIntegration: Integration; client: QueryClient; route: string }
) => {
  const history = createMemoryHistory();
  history.push(route);
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('class', 'integrations-ui-style-scope');
  document.body.appendChild(modalRoot);
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
  origin: string
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
        {children}
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
  route: string = EXTRACTION_PIPELINES_PATH,
  runFilter?: RunFilterProviderProps
) => {
  const history = createMemoryHistory();
  history.push(route);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
        <RunFilterProvider {...runFilter}>
          <Router history={history}>
            <SelectedIntegrationProvider initIntegration={initIntegration}>
              {children}
            </SelectedIntegrationProvider>
          </Router>
        </RunFilterProvider>
      </AppEnvProvider>
    </QueryClientProvider>
  );
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('class', 'integrations-ui-style-scope');
  document.body.appendChild(modalRoot);
  return { wrapper, history };
};
export const renderRegisterContext = (
  ui: React.ReactNode,
  {
    client,
    project,
    cdfEnv,
    origin,
    route = EXTRACTION_PIPELINES_PATH,
    initRegisterIntegration = {},
    ...renderOptions
  }: {
    client: QueryClient;
    project: string;
    cdfEnv: string;
    origin: string;
    route: string;
    initRegisterIntegration: Partial<RegisterIntegrationInfo>;
  }
) => {
  const history = createMemoryHistory();
  history.push(route);
  return {
    ...render(
      <QueryClientProvider client={client}>
        <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
          <RegisterIntegrationProvider
            initIntegration={initRegisterIntegration}
          >
            <Router history={history}>{ui}</Router>
          </RegisterIntegrationProvider>
        </AppEnvProvider>
      </QueryClientProvider>,
      renderOptions
    ),
    history,
  };
};

export const renderWithQueryClient = (client: QueryClient) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return wrapper;
};

export const renderWithReactHookForm = (
  ui: React.ReactElement,
  { defaultValues = {} } = {}
) => {
  const Wrapper: FunctionComponent = ({ children }: PropsWithChildren<{}>) => {
    const methods = useForm({ defaultValues });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return { ...render(ui, { wrapper: Wrapper }) };
};

export const renderWithRunFilterContext = (
  ui: React.ReactNode,
  { providerProps, ...renderOptions }: { providerProps: RunFilterProviderProps }
) => {
  return render(
    <RunFilterProvider {...providerProps}>{ui}</RunFilterProvider>,
    renderOptions
  );
};
