import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import { I18nContainer } from '@cognite/react-i18n';

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
};

export const decorators = [
  (Story) => (
    <I18nContainer>
      <Story />
    </I18nContainer>
  ),
];
