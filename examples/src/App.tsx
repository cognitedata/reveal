/*
 * Copyright 2020 Cognite AS
 */

import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { routes } from './routes';
import { Container } from './components/styled';

export default function App() {
  return (
    <Router>
      <div
        style={{
          padding: '5px',
        }}
      >
        <div
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 5px 0px',
            background: 'rgb(255, 255, 255)',
            padding: '15px',
            borderRadius: '4px',
            minHeight: '95vh',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'auto',
          }}
        >
          <Switch>
            {routes.map((page) => (
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
            <Route key="/" path="/">
              <h1 style={{ margin: 0 }}>Select an example:</h1>
              <nav>
                <ul style={{ paddingLeft: '20px' }}>
                  {routes.map((page) => (
                    <li key={page.path}>
                      <Link to={page.path}>{page.menuTitle}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}
