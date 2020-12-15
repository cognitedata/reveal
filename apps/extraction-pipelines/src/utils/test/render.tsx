import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'utils/utils';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { SelectedIntegrationProvider } from '../../hooks/useSelectedIntegration';
import { AppEnvProvider } from '../../hooks/useAppEnv';
import { IntegrationProvider } from '../../hooks/details/IntegrationContext';
import { Integration } from '../../model/Integration';

export const PROJECT_ITERA_INT_GREEN: Readonly<string> = 'itera-int-green';
export const ORIGIN_DEV: Readonly<string> = 'dev';
export const CDF_ENV_GREENFIELD: Readonly<string> = 'greenfield';
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
  { initIntegration, ...renderOptions }
) => {
  return render(
    <SelectedIntegrationProvider initIntegration={initIntegration}>
      {ui}
    </SelectedIntegrationProvider>,
    renderOptions
  );
};
export const renderWithReactQueryCacheProvider = (
  queryCache: QueryCache,
  project: string,
  cdfEnv: string,
  origin: string
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
        {children}
      </AppEnvProvider>
    </ReactQueryCacheProvider>
  );
  return wrapper;
};
export const renderQueryCacheIntegration = (
  queryCache: QueryCache,
  project: string,
  cdfEnv: string,
  origin: string,
  integration: Integration
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
        <IntegrationProvider initIntegration={integration}>
          {children}
        </IntegrationProvider>
      </AppEnvProvider>
    </ReactQueryCacheProvider>
  );
  return wrapper;
};
