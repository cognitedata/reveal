import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import Home from 'pages/Home';
import ClassifierPage from 'pages/Classifier/Classifier';
import { createBrowserHistory } from 'history';
import { ToastContainer } from '@cognite/cogs.js';
import { Breadcrumb } from './Classifier/components/breadcrumb/Breadcrumb';
import DocumentPage from './Document/Document';

export const MainRouter = () => {
  const history = createBrowserHistory();

  return (
    <>
      <Breadcrumb />
      <ToastContainer />

      <Router history={history}>
        <Switch>
          <Route
            path={[
              '/:project/documents/classifier/:classifierName/:modelName',
              '/:project/documents/classifier/:classifierName',
            ]}
            component={ClassifierPage}
          />
          <Route
            path="/:project/documents/document/:externalId"
            component={DocumentPage}
          />
          <Route path="/:project/documents" component={Home} />
        </Switch>
      </Router>
    </>
  );
};
