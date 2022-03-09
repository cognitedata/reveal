import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  AuthWrapper,
  SubAppWrapper,
  getProject,
  getEnv,
} from '@cognite/cdf-utilities';
import { Routes } from 'src/Routes';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import GlobalStyles from 'src/styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import AntStyles from 'src/styles/AntStyles';
import theme from 'src/styles/theme';
import { Loader } from '@cognite/cogs.js';
import { ThemeProvider } from 'styled-components';
import { SDKProvider } from '@cognite/sdk-provider';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { Provider as ReduxProvider } from 'react-redux';
import store from 'src/store';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';
import { FlagProvider } from '@cognite/react-feature-flags';
import rootStyles from './styles/index.css';

const App = () => {
  const subAppName = 'cdf-vision-subapp';
  const history = createBrowserHistory({
    forceRefresh: false,
  });
  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    datePickerStyle.use(); // Needed to render date filer correctly

    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      datePickerStyle.unuse();
    };
  }, []);

  const queryClient = new QueryClient();

  const project = getProject();
  const env = getEnv();
  return (
    <AntStyles>
      <AuthWrapper
        loadingScreen={<Loader />}
        login={() => loginAndAuthIfNeeded(project, env)}
      >
        <ThemeProvider theme={theme}>
          <SDKProvider sdk={sdk}>
            <FlagProvider // https://cog.link/cdf-frontend-wiki
              apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
              appName={subAppName}
              projectName={project}
              remoteAddress={window.location.hostname}
            >
              <QueryClientProvider client={queryClient}>
                <ReduxProvider store={store}>
                  <SubAppWrapper title="Cognite Vision">
                    <Router history={history}>
                      <Routes />
                    </Router>
                  </SubAppWrapper>
                </ReduxProvider>
              </QueryClientProvider>
            </FlagProvider>
          </SDKProvider>
        </ThemeProvider>
        <GlobalStyles theme={theme} />
      </AuthWrapper>
    </AntStyles>
  );
};

export default App;
