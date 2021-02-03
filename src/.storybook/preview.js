import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'rc-collapse/assets/index.css';
import 'react-datepicker/dist/react-datepicker.css';
import { Container, sdkMock } from '../docs/stub';
import { DataExplorationProvider } from '../context';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};

const queryClient = new QueryClient();

export const decorators = [
  (storyFn) => (
    <Container>
      <Router history={createBrowserHistory()}>
        <DataExplorationProvider sdk={sdkMock}>
          <QueryClientProvider client={queryClient}>
            {storyFn()}
          </QueryClientProvider>
        </DataExplorationProvider>
      </Router>
    </Container>
  ),
];
