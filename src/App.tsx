import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';
import sdk from 'sdk-singleton';
import debounce from 'lodash/debounce';
import { createBrowserHistory } from 'history';
import GlobalStyles from 'styles/GlobalStyles';
import AntStyles from 'components/AntStyles';
import { setupSentry } from 'utils/setupSentry';
import store, { persistedState, loadLocalStorage } from 'store';
import { AppStateProvider } from 'context';
import RootApp from 'pages/App';

const App = () => {
  const tenant = window.location.pathname.split('/')[1];
  const history = createBrowserHistory();

  if (!tenant) {
    throw new Error('tenant missing');
  }

  const LS_KEY = `PNID_CONTEXTUALIZATION_${tenant}`;

  const updateLocalStorage = debounce(() => {
    const localStorageContent = persistedState(store.getState());
    localStorage.setItem(LS_KEY, JSON.stringify(localStorageContent));
  }, 333);

  store.subscribe(updateLocalStorage);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  useEffect(() => {
    loadLocalStorage(LS_KEY, store);
  }, [LS_KEY]);

  useEffect(() => {
    cogsStyles.use();
    setupSentry();
    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <QueryClientProvider client={queryClient}>
      <GlobalStyles>
        <AntStyles>
          <SubAppWrapper padding={false}>
            <AuthWrapper
              showLoader
              includeGroups
              loadingScreen={<Loader darkMode={false} />}
              subAppName="context-ui-pnid"
            >
              <SDKProvider sdk={(sdk as unknown) as CogniteClient}>
                <AppStateProvider>
                  <Provider store={store}>
                    <Router history={history}>
                      <Switch>
                        <Route
                          path="/:tenant/pnid_parsing_new"
                          component={RootApp}
                        />
                      </Switch>
                    </Router>
                  </Provider>
                </AppStateProvider>
              </SDKProvider>
            </AuthWrapper>
          </SubAppWrapper>
        </AntStyles>
      </GlobalStyles>
    </QueryClientProvider>
  );
};

export default App;
