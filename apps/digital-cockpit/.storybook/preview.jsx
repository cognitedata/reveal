import { addDecorator } from '@storybook/react';
import appProvidersDecorator from './appProvidersDecorator';
import '@cognite/cogs.js/dist/cogs.css';

addDecorator(appProvidersDecorator);

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
};
