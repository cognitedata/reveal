import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { SDKProvider } from '@cognite/sdk-provider';
import sdk from 'sdk-singleton';
import debounce from 'lodash/debounce';
import { createBrowserHistory } from 'history';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import AntStyles from 'components/AntStyles';
import GlobalStyles from 'styles/GlobalStyles';
import { setupSentry } from 'utils/setupSentry';
import store, { persistedState, loadLocalStorage } from 'store';
import RootApp from 'pages/App';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileContextualizationContextProvider } from '@cognite/data-exploration';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';

const App = () => {
  const tenant = window.location.pathname.split('/')[1];
  const history = createBrowserHistory();

  if (!tenant) {
    throw new Error('tenant missing');
  }

  const LS_KEY = `PNID_CONTEXTUALIZATION_${tenant}`;

  useEffect(() => {
    loadLocalStorage(LS_KEY, store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    cogsStyles.use();
    setupSentry();

    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <QueryClientProvider client={queryClient}>
      <FileContextualizationContextProvider>
        <CogniteFileViewer.Provider sdk={sdk}>
          <ResourceSelectionProvider>
            <AntStyles>
              <GlobalStyles>
                <SubAppWrapper>
                  <AuthWrapper subAppName="context-ui-pnid">
                    <SDKProvider sdk={sdk}>
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
                    </SDKProvider>
                  </AuthWrapper>
                </SubAppWrapper>
              </GlobalStyles>
            </AntStyles>
          </ResourceSelectionProvider>
        </CogniteFileViewer.Provider>
      </FileContextualizationContextProvider>
    </QueryClientProvider>
  );
};

export default App;
