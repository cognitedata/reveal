import { translations } from '@charts-app/common/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';

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
  const project = getProject();
  const env = getEnv();

  return (
    <I18nWrapper translations={translations} defaultNamespace={projectName}>
      <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
        <SubAppWrapper title={projectName}>
          <QueryClientProvider client={queryClient}>
            <RootApp />
          </QueryClientProvider>
        </SubAppWrapper>
      </AuthWrapper>
    </I18nWrapper>
  );
};
