import React from 'react';
import I18nContainer from 'containers/I18nContainer';
import Home from 'pages/Home';
import GlobalStyles from 'global-styles';

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
