import React, { FunctionComponent, PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'utils/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { useForm, FormProvider } from 'react-hook-form';
import { SelectedExtpipeProvider } from 'hooks/useSelectedExtpipe';
import { AppEnvProvider } from 'hooks/useAppEnv';
import { Extpipe, RegisterExtpipeInfo } from 'model/Extpipe';
import { RegisterExtpipeProvider } from 'hooks/useStoredRegisterExtpipe';
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
  return render(
    <Router history={history}>
      <>{ui}</>
    </Router>,
    renderOptions
  );
};

export const renderWithSelectedExtpipeContext = (
  ui: React.ReactNode,
  {
    initExtpipe,
    client,
    route = EXTRACTION_PIPELINES_PATH,
    ...renderOptions
  }: { initExtpipe: Extpipe; client: QueryClient; route: string }
) => {
  const history = createMemoryHistory();
  history.push(route);
  addModalElements();
  return render(
    <QueryClientProvider client={client}>
      <Router history={history}>
        <SelectedExtpipeProvider initExtpipe={initExtpipe}>
          {ui}
        </SelectedExtpipeProvider>
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
        {/* <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}> */}
        {children}
        {/* </AppEnvProvider> */}
      </QueryClientProvider>
    );
  };
  return wrapper;
};

export const renderQueryCacheExtpipe = (
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

function addModalElements() {
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('class', 'extpipes-ui-style-scope');
  document.body.appendChild(modalRoot);
}

export const renderWithReQueryCacheSelectedExtpipeContext = (
  client: QueryClient,
  project: string,
  cdfEnv: string,
  origin: string,
  initExtpipe?: Extpipe,
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
            <SelectedExtpipeProvider initExtpipe={initExtpipe}>
              {children}
            </SelectedExtpipeProvider>
          </Router>
        </RunFilterProvider>
      </AppEnvProvider>
    </QueryClientProvider>
  );
  addModalElements();
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
    initRegisterExtpipe = {},
    ...renderOptions
  }: {
    client: QueryClient;
    project: string;
    cdfEnv: string;
    origin: string;
    route: string;
    initRegisterExtpipe: Partial<RegisterExtpipeInfo>;
  }
) => {
  const history = createMemoryHistory();
  history.push(route);
  addModalElements();
  return {
    ...render(
      <QueryClientProvider client={client}>
        <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
          <RegisterExtpipeProvider initExtpipe={initRegisterExtpipe}>
            <Router history={history}>
              <>{ui}</>
            </Router>
          </RegisterExtpipeProvider>
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
