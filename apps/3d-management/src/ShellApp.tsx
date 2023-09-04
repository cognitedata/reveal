import { lazy } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import styled, { ThemeProvider } from 'styled-components';

import { createBrowserHistory } from 'history';

import { PageTitle } from '@cognite/cdf-utilities';

import { FallbackWrapper } from './components/FallbackWrapper';
import configureStore from './store';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';
import { APP_TITLE } from './utils';

// lazy loads
const AllModels = lazy(() => import('./pages/AllModels'));
const RevisionDetails = lazy(() => import('./pages/RevisionDetails'));
const NoAccessPage = lazy(() => import('./pages/NoAccessPage'));

export const App = () => {
  const history = createBrowserHistory();
  const store = configureStore(history);

  return (
    <GlobalStyles>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThreeDAppWrapper>
            <PageTitle title={APP_TITLE} />

            <Routes>
              <Route path="/" element={FallbackWrapper(AllModels)} />
              <Route
                path="/:modelId/revisions/:revisionId"
                element={FallbackWrapper(RevisionDetails)}
              />
              <Route path="*" element={FallbackWrapper(NoAccessPage)} />
            </Routes>
          </ThreeDAppWrapper>
        </ThemeProvider>
      </Provider>
    </GlobalStyles>
  );
};

export default App;

const ThreeDAppWrapper = styled.div`
  padding: 24px 40px;
`;
