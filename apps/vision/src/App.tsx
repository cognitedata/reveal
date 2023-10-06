import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer, getProject } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { FlagProvider } from '@cognite/react-feature-flags';

import { DataExplorationWrapper } from './DataExplorationWrapper';
import { AppRoutes } from './Routes';
import store from './store';
import AntStyles from './styles/AntStyles';
import GlobalStyles from './styles/global-styles';
import rootStyles from './styles/index.css';
import theme from './styles/theme';

const App = () => {
  const subAppName = 'cdf-vision-subapp';
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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  const project = getProject();

  return (
    <AntStyles>
      <ThemeProvider theme={theme}>
        <FlagProvider // https://cog.link/cdf-frontend-wiki
          apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
          appName={subAppName}
          projectName={project}
          remoteAddress={window.location.hostname}
        >
          <QueryClientProvider client={queryClient}>
            <AuthContainer
              title="Cognite Vision"
              sdk={sdk}
              login={loginAndAuthIfNeeded}
            >
              <ReduxProvider store={store}>
                <DataExplorationWrapper>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/*" element={<AppRoutes />} />
                    </Routes>
                  </BrowserRouter>
                </DataExplorationWrapper>
              </ReduxProvider>
            </AuthContainer>
          </QueryClientProvider>
        </FlagProvider>
      </ThemeProvider>
      <GlobalStyles theme={theme} />
    </AntStyles>
  );
};

export default App;
