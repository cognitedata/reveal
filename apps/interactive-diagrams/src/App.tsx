import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
// import { Route, Routes, BrowserRouter } from 'react-router-dom';

import { AppStateProvider } from '@interactive-diagrams-app/context';
import { setItemInStorage } from '@interactive-diagrams-app/hooks';
// import RootApp from '@interactive-diagrams-app/pages/App';
// import { root } from '@interactive-diagrams-app/routes/paths';
import store, {
  persistedState,
  loadLocalStorage,
} from '@interactive-diagrams-app/store';
import { LS_KEY_PREFIX } from '@interactive-diagrams-app/stringConstants';
import { AntStyles, GlobalStyles } from '@interactive-diagrams-app/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import debounce from 'lodash/debounce';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  SubAppWrapper,
  getProject,
  getEnv,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { SDKProvider } from '@cognite/sdk-provider';

const App = () => {
  const project = getProject();
  const env = getEnv();
  const LS_KEY = `${LS_KEY_PREFIX}_${project}`;

  const updateLocalStorage = debounce(() => {
    const localStorageContent = persistedState(store.getState());
    setItemInStorage(LS_KEY, localStorageContent);
  }, 333);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  store.subscribe(updateLocalStorage);

  useEffect(() => {
    loadLocalStorage(LS_KEY, store);
  }, [LS_KEY]);

  useEffect(() => {
    if (cogsStyles?.use) cogsStyles.use();
    return () => {
      if (cogsStyles?.unuse) cogsStyles.unuse();
    };
  }, []);

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <GlobalStyles>
      <AntStyles>
        <AuthWrapper
          loadingScreen={<Loader darkMode={false} />}
          login={() => loginAndAuthIfNeeded(project, env)}
        >
          <SDKProvider sdk={sdk}>
            <QueryClientProvider client={queryClient}>
              <AppStateProvider>
                <Provider store={store}>
                  <SubAppWrapper title="Interactive Engineering Diagrams">
                    <div>test</div>
                  </SubAppWrapper>
                </Provider>
              </AppStateProvider>
            </QueryClientProvider>
          </SDKProvider>
        </AuthWrapper>
      </AntStyles>
    </GlobalStyles>
  );
};

export default App;
