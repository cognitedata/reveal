import { translations } from '@charts-app/common/i18n';
import { AuthContainer } from '@charts-app/components/AuthContainer';
import config from '@charts-app/config/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import { RootApp } from './App';

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
