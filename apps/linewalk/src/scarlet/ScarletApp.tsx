import { generatePath, Redirect, Route, Switch } from 'react-router-dom';

import { AppProvider } from './contexts';
import { Equipment, Home, Support } from './pages';
import { RoutePath } from './routes';

export const ScarletApp = () => (
  <AppProvider>
    <Switch>
      <Route path={RoutePath.EQUIPMENT} render={() => <Equipment />} />
      <Route path={RoutePath.SUPPORT} render={() => <Support />} />
      <Route path={RoutePath.UNIT} render={() => <Home key="home" />} />
      <Route path={RoutePath.FACILITY} render={() => <Home key="home" />} />
      <Route path={RoutePath.HOME} render={() => <Home key="home" />} />
      <Redirect from="" to={generatePath(RoutePath.HOME)} />
    </Switch>
  </AppProvider>
);
