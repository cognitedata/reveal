/*
 * Copyright 2020 Cognite AS
 */

import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import {exampleRoutes, testRoutes} from './routes';
import { Container } from './components/styled';
import styled from "styled-components";


const PageContainer = styled.div`
  box-shadow: rgba(0, 0, 0, 0.1) 0 1px 5px 0;
  background: rgb(255, 255, 255);
  padding: 15px;
  border-radius: 4px;
  min-height: 95vh;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`

export default function App() {
  const MainMenuPage = () => <Route path="/">
    <h1 style={{ margin: 0 }}>Select an example:</h1>
    <nav>
      <ul style={{ paddingLeft: '20px' }}>
        {exampleRoutes.map((page) => (
          <li key={page.path}>
            <Link to={page.path}>{page.menuTitle}</Link>
          </li>
        ))}
      </ul>

      <h2>Snapshot tests pages</h2>

      <ul style={{ marginTop: '16px', paddingLeft: '20px' }}>
        {testRoutes.map((page) => (
          <li key={page.path}>
            <Link to={page.path}>{page.menuTitle}</Link>
          </li>
        ))}
      </ul>
    </nav>
  </Route>

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div style={{ padding: '5px' }}>
        <PageContainer>
          <Switch>
            {exampleRoutes.concat(testRoutes).map((page) => (
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
