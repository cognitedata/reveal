import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import {
  Container,
  Logout,
  AuthConsumer,
  AuthContext,
} from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import ModelLibrary from 'pages/ModelLibrary';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { configureStore } from 'store';
import { PartialRootState } from 'store/types';
import { Provider as ReduxProvider } from 'react-redux';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import NewModel from 'pages/ModelLibrary/NewModel';

interface AppProps {
  initialState?: PartialRootState;
}

export default function App({ initialState = {} }: AppProps) {
  const store = configureStore(initialState);
  return (
    <Container sidecar={sidecar}>
      <AuthConsumer>
        {({ client }: AuthContext) =>
          client ? (
            <CdfClientProvider client={client}>
              <ReduxProvider store={store}>
                <GlobalStyles />
                <MenuBar />
                <Switch>
                  <Route
                    exact
                    path={PAGES.MODEL_LIBRARY}
                    component={ModelLibrary}
                  />
                  <Route path={PAGES.MODEL_LIBRARY_NEW} component={NewModel} />
                  <Route path={PAGES.LOGOUT} render={() => <Logout />} />
                  <Redirect from="" to={PAGES.MODEL_LIBRARY} />
                  <Redirect from="/" to={PAGES.MODEL_LIBRARY} />
                  <Route render={() => <NotFoundPage />} />
                </Switch>
              </ReduxProvider>
            </CdfClientProvider>
          ) : null
        }
      </AuthConsumer>
    </Container>
  );
}
