import { Loader, ToastContainer } from '@cognite/cogs.js';
import { Switch, Redirect, Route } from 'react-router-dom';
import { GlobalStyles } from 'GlobalStyles';
import sidecar from 'utils/sidecar';
import { Container, AuthConsumer } from '@cognite/react-container';
import NotFoundPage from 'pages/Error404';
import { List } from 'pages/Home';
import Search from 'pages/Search';
import { MenuBar, PAGES } from 'pages/Menubar';
import { KBarProviderWrapper } from 'pages/providers/KBarProviderWrapper';

import { ProvideAuthSetup } from './pages/providers/AuthProvider';
import { ThemeProvider } from './pages/providers/ThemeProvider';

const App = () => {
  return (
    <Container sidecar={sidecar}>
      <ThemeProvider>
        <GlobalStyles />
        <MenuBar />
        <KBarProviderWrapper>
          <AuthConsumer>
            {(authState) => {
              if (!authState || !authState.authState?.authenticated) {
                return <Loader />;
              }

              return (
                <ProvideAuthSetup authState={authState}>
                  <ToastContainer />
                  <Switch>
                    <Route path={PAGES.HOME} render={() => <List />} />
                    <Route path={PAGES.SEARCH} render={() => <Search />} />
                    <Redirect from="" to={PAGES.HOME} />
                    <Redirect from="/" to={PAGES.HOME} />
                    <Route render={() => <NotFoundPage />} />
                  </Switch>
                </ProvideAuthSetup>
              );
            }}
          </AuthConsumer>
        </KBarProviderWrapper>
      </ThemeProvider>
    </Container>
  );
};

export default App;
