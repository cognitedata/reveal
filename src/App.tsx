import React from 'react';
import Home from 'pages/Home';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { setupMixpanel } from 'utils/config';

setupMixpanel();

const App = () => {
  const subAppName = 'cdf-vision-subapp';
  return (
    <GlobalStyles>
      <SubAppWrapper>
        <AuthWrapper subAppName={subAppName}>
          <Home />
        </AuthWrapper>
      </SubAppWrapper>
    </GlobalStyles>
  );
};

export default App;
