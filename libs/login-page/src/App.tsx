import React, { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import { selectProjectRoute } from '@cognite/login-utils';
import { FlagProvider } from '@cognite/react-feature-flags';

import { translations } from './common/i18n';
import { Background } from './components/background/Background';
import { DomainHelpModal } from './components/containers';
import { LoginPageProvider } from './contexts/LoginPageContext';
import SelectProject from './modules/select-project/SelectProject';
import SelectSignInMethod from './modules/select-sign-in-method/SelectSignInMethod';
import GlobalStyles from './styles/GlobalStyles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  useEffect(() => {
    trackEvent('LoginPageView');
  }, []);
  const appName = 'cdf-login-page';
  const [isHelpModalVisible, setIsHelpModalVisible] = useState<boolean>(false);

  return (
    <I18nWrapper translations={translations} defaultNamespace="login-page">
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName={appName}
        projectName={appName}
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <MemoryRouter>
              <LoginPageProvider>
                <Background>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <React.Fragment>
                          <DomainHelpModal
                            visible={isHelpModalVisible}
                            setVisible={setIsHelpModalVisible}
                          />
                          <SelectSignInMethod
                            isHelpModalVisible={isHelpModalVisible}
                            setIsHelpModalVisible={setIsHelpModalVisible}
                          />
                        </React.Fragment>
                      }
                    />
                    <Route
                      path={selectProjectRoute}
                      element={<SelectProject />}
                    />
                  </Routes>
                </Background>
              </LoginPageProvider>
            </MemoryRouter>
          </GlobalStyles>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;
