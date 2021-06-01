import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import GlobalStyles from 'global-styles';
import { addDecorator } from '@storybook/react';
import I18nContainer from 'containers/I18nContainer';

addDecorator((story) => {
  return (
    <I18nContainer>
      <GlobalStyles></GlobalStyles>
      {story()}
    </I18nContainer>
  );
});
