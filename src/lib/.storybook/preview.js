import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'rc-collapse/assets/index.css';
import { Container, sdkMock } from '../docs/stub';
import { DataExplorationProvider } from '../context';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};

export const decorators = [
  (storyFn) => (
    <Container>
      <Router history={createBrowserHistory()}>
        <DataExplorationProvider sdk={sdkMock}>
          {storyFn()}
        </DataExplorationProvider>
      </Router>
    </Container>
  ),
];
