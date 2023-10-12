import '@cognite/cogs.js/dist/cogs.css';
import './setupMSW';

import { Preview } from '@storybook/react';
import { mswLoader } from 'msw-storybook-addon';

import {
  withProviders,
  withDataModels,
  withResetDataModels,
} from './decorators';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};

const preview: Preview = {
  decorators: [withProviders, withDataModels, withResetDataModels],
  loaders: [mswLoader],
};

export default preview;
