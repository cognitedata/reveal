import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { configureI18n, I18nContainer } from '@cognite/react-i18n';
import GlobalStyles from 'global-styles';

import '@cognite/cogs.js/dist/cogs.css';

configureI18n();

export const decorators = [
  (Story) => (
    <I18nContainer>
      <BrowserRouter>
        <GlobalStyles />
        <Story />
      </BrowserRouter>
    </I18nContainer>
  ),
];

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
};
