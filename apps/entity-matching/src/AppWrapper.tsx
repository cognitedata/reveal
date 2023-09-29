import { useEffect } from 'react';

import './set-public-path';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { CogniteError } from '@cognite/sdk';

import App from './app/App';
import { translations } from './app/common/i18n';
import GlobalStyles from './app/styles/GlobalStyles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: true,
      retry(count, error) {
        if ((error as CogniteError).status === 403) {
          return false;
        }
        return count <= 3;
      },
    },
  },
});

export const AppWrapper = () => {
  const projectName = 'entity-matching';

  useEffect(() => {
    cogsStyles.use();
    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    <GlobalStyles>
      <QueryClientProvider client={queryClient}>
        <I18nWrapper translations={translations} defaultNamespace={projectName}>
          <ToastContainer />
          <AuthContainer
            title="Entity matching"
            sdk={sdk}
            login={loginAndAuthIfNeeded}
          >
            <App />
          </AuthContainer>
        </I18nWrapper>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GlobalStyles>
  );
};
