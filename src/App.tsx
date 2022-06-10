import React from 'react';
import { languages, translations } from 'common/i18n';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {
  AuthWrapper,
  getEnv,
  getProject,
  I18nWrapper,
  SubAppWrapper,
  setupTranslations,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import GlobalStyles from 'styles/GlobalStyles';
import Home from 'pages/Home';
import i18next from 'i18next';

setupTranslations(translations);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});
const env = getEnv();
const project = getProject();

const App = () => {
  const handleLanguageChange = (language: string) => {
    if (languages.includes(language)) {
      return i18next.changeLanguage(language);
    }
    return Promise.resolve();
  };

  return (
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="cdf-extractor-downloads"
      projectName={project}
    >
      <I18nWrapper onLanguageChange={handleLanguageChange}>
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <SubAppWrapper title="Access Management">
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(project, env)}
              >
                <SDKProvider sdk={sdk}>
                  <Router>
                    <Switch>
                      <Route
                        path={['/:tenant/:path/:page', '/:tenant/:path']}
                        component={Home}
                      />
                    </Switch>
                  </Router>
                </SDKProvider>
              </AuthWrapper>
            </SubAppWrapper>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </I18nWrapper>
    </FlagProvider>
  );
};

export default App;
