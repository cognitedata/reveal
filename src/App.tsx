import React from 'react';
import GlobalStyles from 'global-styles';

import { I18nContainer } from '@cognite/react-i18n';

import Home from 'pages/Home';

const App = () => {
  return (
    <>
      <GlobalStyles />
      <I18nContainer>
        <Home />
      </I18nContainer>
    </>
  );
};

export default App;
