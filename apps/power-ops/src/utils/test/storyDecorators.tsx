import { CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route } from 'react-router-dom';
import { AuthProvider } from '@cognite/react-container';
import { PartialStoryFn } from '@storybook/csf';
import { ReactFramework } from '@storybook/react';
import { ComponentProps, CSSProperties } from 'react';
import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import isChromatic from 'chromatic/isChromatic';

export const globalStylesDecorator = (
  Story: PartialStoryFn<ReactFramework>
) => (
  <>
    <GlobalStyles />
    <Story />
  </>
);

export const boxDecorator =
  (style: CSSProperties = {}) =>
  (Story: PartialStoryFn<ReactFramework>) =>
    isChromatic() ? (
      <div style={style}>
        <Story />
      </div>
    ) : (
      <Story />
    );

const mockContext = (project = 'test', userEmail = 'testuser@cognite.com') => ({
  client: new CogniteClient({
    appId: 'power-ops-tests',
    baseUrl: sidecar.cdfApiBaseUrl,
    project,
    getToken: async () => project,
  }),
  authState: {
    authenticated: true,
    initialising: false,
    project,
    token: project,
    idToken: project,
    error: false,
    username: userEmail.split('@')[0],
    email: userEmail,
    id: userEmail.split('@')[0],
  },
  reauthenticate: () => null,
});

export const authDecorator =
  (...params: Parameters<typeof mockContext>) =>
  (Story: PartialStoryFn<ReactFramework>) =>
    (
      <AuthProvider.Provider value={mockContext(...params)}>
        <Story />
      </AuthProvider.Provider>
    );

export const reactQueryDecorator = (Story: PartialStoryFn<ReactFramework>) => (
  <QueryClientProvider client={new QueryClient()}>
    <Story />
  </QueryClientProvider>
);

export const reactQueryDevToolsDecorator = (
  Story: PartialStoryFn<ReactFramework>
) => (
  <>
    <ReactQueryDevtools initialIsOpen />
    <Story />
  </>
);

export const reactRouterDecorator =
  (props: ComponentProps<typeof MemoryRouter> = {}, path = '/*') =>
  (Story: PartialStoryFn<ReactFramework>) =>
    (
      <MemoryRouter {...props}>
        <Route path={path} component={Story} />
      </MemoryRouter>
    );
