import React, { useEffect } from 'react';
import { Provider } from 'react-redux';

import debounce from 'lodash/debounce';

import { getProject } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import { AppStateProvider } from './context';
import { setItemInStorage } from './hooks';
import RootApp from './pages/App';
import store, { loadLocalStorage, persistedState } from './store';
import { LS_KEY_PREFIX } from './stringConstants';
import { AntStyles, GlobalStyles } from './styles';

const App = () => {
  const project = getProject();
  const LS_KEY = `${LS_KEY_PREFIX}_${project}`;

  const updateLocalStorage = debounce(() => {
    const localStorageContent = persistedState(store.getState());
    setItemInStorage(LS_KEY, localStorageContent);
  }, 333);

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
        <Provider store={store}>
          <AppStateProvider>
            <RootApp />
          </AppStateProvider>
        </Provider>
      </AntStyles>
    </GlobalStyles>
  );
};

export default App;
