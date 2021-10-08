import React from 'react';
import Home from 'pages/Home';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { setupMixpanel } from 'utils/config';

setupMixpanel();

const App = () => {
  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <GlobalStyles>
      <SubAppWrapper>
        <AuthWrapper subAppName="raw-explorer">
          <Home />
        </AuthWrapper>
      </SubAppWrapper>
    </GlobalStyles>
  );
};

export default App;
