import '@cognite/cogs.js/dist/cogs.css';

import { Preview } from '@storybook/react';

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
};

export default preview;
