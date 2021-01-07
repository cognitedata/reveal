/*
 * Copyright 2020 Cognite AS
 */

import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import {
  ExampleRoute,
  exampleRoutes,
  testRoutesCad,
  testRoutesPointCloud,
} from './routes';
import { Container } from './components/styled';
import styled from 'styled-components';

const PageContainer = styled.div`
  box-shadow: rgba(0, 0, 0, 0.1) 0 1px 5px 0;
  background: rgb(255, 255, 255);
  padding: 15px;
  border-radius: 4px;
  min-height: 95vh;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;

const UlStyled = styled.ul`
  padding-left: 20px;
  margin: 16px 0;

  > li {
    padding: 2px 0;
    font-size: 1.4em;
  }
`;

const PagesList = (props: { routes: ExampleRoute[] }) => {
  return (
    <UlStyled>
      {props.routes.map((page) => (
        <li key={page.path}>
          <Link to={page.path}>{page.menuTitle}</Link>
        </li>
      ))}
    </UlStyled>
  );
};

export default function App() {
  const MainMenuPage = () => (
    <Route path="/">
      <h1 style={{ margin: 0 }}>Select an example:</h1>
      <nav>
        <PagesList routes={exampleRoutes} />

        <h2>Snapshot CAD tests pages</h2>

        <PagesList routes={testRoutesCad} />

        <h2>Snapshot Pointcloud tests pages</h2>

        <PagesList routes={testRoutesPointCloud} />
      </nav>
    </Route>
  );

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div style={{ padding: '5px' }}>
        <PageContainer>
          <Switch>
            {exampleRoutes
              .concat(testRoutesCad, testRoutesPointCloud)
              .map((page) => (
                <Route
                  key={page.path}
                  path={
                    page.path.includes('?')
                      ? page.path.slice(0, page.path.indexOf('?'))
                      : page.path
                  }
                >
                  <Container>
                    <Link to="/">Back to menu</Link>
                    <h1 style={{ margin: 0 }}>{page.menuTitle}</h1>
                    {page.component}
                  </Container>
                </Route>
              ))}

            <MainMenuPage key="/" />
          </Switch>
        </PageContainer>
      </div>
    </Router>
  );
}
