import React from 'react';
import { action } from '@storybook/addon-actions';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import CardContainer from './CardContainer';

const cache = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: false,
    },
  },
});

export default {
  title: 'Authentication/CardContainer',
  decorators: [
    (Story: () => React.ReactElement) => (
      <QueryClientProvider client={cache}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

const cardContainerProps = {
  applicationId: 'test-id',
  applicationName: 'test-name',
  cdfCluster: 'test-cdfCluster',
  directory: 'test-directory',
  handleSubmit: action('handleSubmit'),
  handleClusterSubmit: action('handleClusterSubmit'),
  validateTenant: () => Promise.resolve(true),
  validateCluster: () => Promise.resolve(true),
  loading: false,
  initialTenant: '',
  enabledLoginModes: {
    cognite: true,
    aad: true,
    adfs: true,
  },
  authState: {
    authenticated: false,
    initialising: false,
  },
};

export const Base = () => <CardContainer {...cardContainerProps} />;

export const WithoutLegacy = () => (
  <CardContainer {...cardContainerProps} enabledLoginModes={{ aad: true }} />
);

export const WithoutLegacyWithErrors = () => (
  <CardContainer
    {...cardContainerProps}
    enabledLoginModes={{ aad: true }}
    authState={{
      authenticated: false,
      initialising: false,
      error: true,
      errorMessage:
        'This is a really long error message with technical details that spans many lines. That is why we want to hide it.',
    }}
  />
);

export const WithInitialTenant = () => (
  <CardContainer {...cardContainerProps} initialTenant="initial-tenant" />
);

export const WithInitialCluster = () => (
  <CardContainer
    {...cardContainerProps}
    initialTenant="initial-tenant"
    initialCluster="initial-cluster"
  />
);

export const Loading = () => (
  <CardContainer
    {...cardContainerProps}
    initialTenant="initial-tenant"
    loading
  />
);

export const WithError = () => (
  <CardContainer {...cardContainerProps} errors={['This is a login error']} />
);

export const ProjectSelection = () => (
  <CardContainer
    {...cardContainerProps}
    authState={{
      authenticated: true,
      initialising: false,
      error: false,
      errorMessage: '',
    }}
  />
);
