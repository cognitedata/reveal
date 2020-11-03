import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { configureI18n, I18nContainer } from '@cognite/react-i18n';
import GlobalStyles from 'global-styles';

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
