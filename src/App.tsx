import React, { useEffect } from 'react';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { setupMixpanel } from 'src/utils/config';
import { Routes } from 'src/Routes';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import GlobalStyles from 'src/styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import AntStyles from 'src/styles/AntStyles';
import theme from 'src/styles/theme';
import { Loader } from '@cognite/cogs.js';
import { ThemeProvider } from 'styled-components';
import rootStyles from './styles/index.css';

setupMixpanel();

const App = () => {
  const subAppName = 'cdf-vision-subapp';
  const history = createBrowserHistory();
  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();

    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
    };
  }, []);
  return (
    <AntStyles>
      <SubAppWrapper>
        <AuthWrapper
          subAppName={subAppName}
          showLoader
          includeGroups
          loadingScreen={<Loader />}
        >
          <ThemeProvider theme={theme}>
            <Router history={history}>
              <Routes />
            </Router>
          </ThemeProvider>
          <GlobalStyles theme={theme} />
        </AuthWrapper>
      </SubAppWrapper>
    </AntStyles>
  );
};

export default App;
