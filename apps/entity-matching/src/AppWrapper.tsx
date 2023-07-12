import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import App from './app/App';
import { translations } from './app/common/i18n';
import GlobalStyles from './app/styles/GlobalStyles';
import './set-public-path';

import { useEffect } from 'react';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { AuthContainer } from './AuthContainer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CogniteError } from '@cognite/sdk';
import { ToastContainer } from '@cognite/cogs.js';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
          <AuthContainer>
            <App />
          </AuthContainer>
        </I18nWrapper>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GlobalStyles>
  );
};
