import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import {
  Container,
  Logout,
  AuthConsumer,
  AuthContext,
} from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import Homepage from 'pages/Homepage';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { configureStore } from 'store';
import { PartialRootState } from 'store/types';
import { Provider as ReduxProvider } from 'react-redux';
import { CdfClientProvider } from 'providers/CdfClientProvider';

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
                  <Route path={PAGES.HOMEPAGE} component={Homepage} />
                  <Route path={PAGES.LOGOUT} render={() => <Logout />} />
                  <Redirect from="" to={PAGES.HOMEPAGE} />
                  <Redirect from="/" to={PAGES.HOMEPAGE} />
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
