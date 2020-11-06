import React from 'react';
import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';

import { Container } from '@cognite/react-container';

import Info from 'pages/Info';
import Home from 'pages/Home';

const NotFoundPage = () => {
  return <div>404</div>;
};

const App = () => {
  return (
    <>
      <GlobalStyles />
      <Container appName="demo-app">
        <Switch>
          <Route path="/home" render={() => <Home />} />
          <Route path="/info" render={() => <Info />} />
          <Redirect from="" to="/home" />
          <Redirect from="/" to="/home" />
          <Route render={() => <NotFoundPage />} />
        </Switch>
      </Container>
    </>
  );
};

export default App;
