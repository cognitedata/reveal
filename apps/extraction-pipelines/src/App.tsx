import React, { useEffect } from 'react';
import Home from 'pages/Home';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { Loader } from '@cognite/cogs.js';
import { ThemeProvider } from 'styled-components';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import collapseStyle from 'rc-collapse/assets/index.css';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { AppEnvProvider } from 'hooks/useAppEnv';
import theme from './styles/theme';
import AntStyles from './styles/AntStyles';
import rootStyles from './styles/index.css';
import { getCdfEnvFromUrl, projectName } from './utils/config';

const App = () => {
  const project = projectName();
  const { origin } = window.location;
  const cdfEnv = getCdfEnvFromUrl();

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

  const queryCache = new QueryCache({
    defaultConfig: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <AntStyles>
        <SubAppWrapper padding={false}>
          <AuthWrapper
            showLoader
            includeGroups
            loadingScreen={<Loader />}
            subAppName="cdf-integrations-ui"
          >
            <ThemeProvider theme={theme}>
              <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
                <Home />
              </AppEnvProvider>
            </ThemeProvider>
            <GlobalStyles theme={theme} />
          </AuthWrapper>
        </SubAppWrapper>
      </AntStyles>
    </ReactQueryCacheProvider>
  );
};

export default App;
