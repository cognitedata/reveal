import { Route, Switch } from 'react-router-dom';
import Home from 'pages/Home';
import Explorer from 'pages/Explorer';
import PageLayout from 'pages/PageLayout';
import SuiteOverview from 'pages/SuiteOverview';

const Routes = (): JSX.Element => (
  <PageLayout>
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route
        exact
        path={['/explore', '/explore/:assetId', '/explore/:assetId/:tab']}
      >
        <Explorer />
      </Route>
      <Route path="/suites/:id">
        <SuiteOverview />
      </Route>
    </Switch>
  </PageLayout>
);

export default Routes;
