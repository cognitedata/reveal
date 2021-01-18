import React from 'react';
import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Loader } from '@cognite/cogs.js';
import { Container } from '@cognite/react-container';

import Info from 'pages/Info';
import Home from 'pages/Home';
import CogniteSDK from 'pages/CogniteSDK';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';

const App = () => (
  <>
    <GlobalStyles />
    <React.Suspense fallback={<Loader />}>
      <Container appName="demo-app">
        <>
          <MenuBar />

          <Switch>
            <Route path={PAGES.HOME} render={() => <Home />} />
            <Route path={PAGES.INFO} render={() => <Info />} />
            <Route path={PAGES.SDK} render={() => <CogniteSDK />} />
            <Redirect from="" to={PAGES.HOME} />
            <Redirect from="/" to={PAGES.HOME} />
            <Route render={() => <NotFoundPage />} />
          </Switch>
        </>
      </Container>
    </React.Suspense>
  </>
);

export default App;
