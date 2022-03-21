import React from 'react';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  I18nWrapper,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { languages, setupTranslations } from 'common/i18n';
import GlobalStyles from 'styles/GlobalStyles';
import { AntStyles } from 'styles/AntStyles';
import i18next from 'i18next';
import ExtractorDownloads from './Home/Extractors';

setupTranslations();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // Pretty long
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
            <AntStyles>
              <SubAppWrapper title="Extractor Downloads">
                <AuthWrapper
                  loadingScreen={<Loader />}
                  login={() => loginAndAuthIfNeeded(project, env)}
                >
                  <SDKProvider sdk={sdk}>
                    <ExtractorDownloads />
                  </SDKProvider>
                </AuthWrapper>
              </SubAppWrapper>
            </AntStyles>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </I18nWrapper>
    </FlagProvider>
  );
};

export default App;
