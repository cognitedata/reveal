import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import '@cognite/cogs.js/dist/antd.css';
import 'rc-collapse/assets/index.css';
import { Container, sdkMock } from '../docs/stub';
import { DataExplorationProvider } from '../context';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};

export const decorators = [
  (storyFn) => (
    <Container>
      <DataExplorationProvider sdk={sdkMock}>
        {storyFn()}
      </DataExplorationProvider>
    </Container>
  ),
];
