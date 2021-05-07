import React from 'react';
import { CogniteAuth } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import { action } from '@storybook/addon-actions';
import { QueryClientProvider, QueryClient } from 'react-query';

import ProjectSelector from './ProjectSelector';
// import * as fetchProjects from './fetchProjects';
// import { sandbox } from '../../utils/test';

// sandbox
//   .stub(fetchProjects, 'fetchProjects')
//   .returns(Promise.resolve([{ urlName: 'test-1' }]));

const cache = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: false,
    },
  },
});

export default {
  title: 'Authentication/ProjectSelector',
  decorators: [
    (Story: () => React.ReactElement) => (
      <QueryClientProvider client={cache}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

const promiseAction = (msg: string) => (...args: unknown[]) => {
  action(msg)(...args);
  return Promise.resolve();
};

const getProps = () => {
  const client = new CogniteClient({ appId: 'test' });
  const authClient = new CogniteAuth(client);

  authClient.login = promiseAction('login');

  return {
    enabled: true,
    authClient,

    authState: {
      authenticated: false,
      initialising: false,
    },
    onSelected: action('onSelected'),
  };
};

// need to fix sandbox stub
export const Base = () => {
  return <ProjectSelector {...getProps()} />;
};

export const Error = () => {
  return <ProjectSelector {...getProps()} />;
};
