import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import { RootApp } from './App';
import { translations } from './app/common/i18n';
import { AuthContainer } from './app/components/AuthContainer';
import config from './app/config/config';

import './set-public-path';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      cacheTime: 60000,
      staleTime: 60000,
    },
  },
});

export const AppWrapper = () => {
  const projectName = 'charts';

  return (
    <I18nWrapper
      translations={translations}
      defaultNamespace="global"
      locizeProjectId={config.locizeProjectId}
      useLocizeBackend
    >
      <QueryClientProvider client={queryClient}>
        <AuthContainer title={projectName}>
          <RootApp />
        </AuthContainer>
      </QueryClientProvider>
    </I18nWrapper>
  );
};
