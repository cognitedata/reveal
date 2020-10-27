import React, { useEffect } from 'react';
import Home from 'pages/Home';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { Loader } from '@cognite/cogs.js';
import { ThemeProvider } from 'styled-components';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import collapseStyle from 'rc-collapse/assets/index.css';
import theme from './styles/theme';
import AntStyles from './styles/AntStyles';
import rootStyles from './styles/index.css';

const App = () => {
  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    collapseStyle.use();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      collapseStyle.unuse();
    };
  }, []);
  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <AntStyles>
      <SubAppWrapper padding={false}>
        <AuthWrapper
          showLoader
          includeGroups
          loadingScreen={<Loader />}
          subAppName="cdf-integrations-ui"
        >
          <ThemeProvider theme={theme}>
            <Home />
          </ThemeProvider>
          <GlobalStyles theme={theme} />
        </AuthWrapper>
      </SubAppWrapper>
    </AntStyles>
  );
};

export default App;
