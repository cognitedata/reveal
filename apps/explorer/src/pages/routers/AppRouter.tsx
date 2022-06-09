import { Switch, Redirect, Route } from 'react-router-dom';
import { NotFoundPage } from 'pages/NotFoundPage';
import { Home } from 'pages/Home';
import { Search } from 'pages/Search';
import { Profile } from 'pages/Profile';
import { Logout } from '@cognite/react-container';

import { PAGES } from './constants';

// Refactor https://dev.to/surajjadhav/how-should-we-structure-our-react-code-2-2-kgh
export const AppRouter = () => {
  return (
    <Switch>
      <Route path={PAGES.HOME} render={() => <Home />} />
      <Route path={PAGES.LOGOUT} render={() => <Logout />} />
      <Route path={PAGES.SEARCH} render={() => <Search />} />
      <Route path={PAGES.PROFILE} render={() => <Profile />} />

      <Redirect from="" to={PAGES.HOME} />
      <Redirect from="/" to={PAGES.HOME} />
      <Route render={() => <NotFoundPage />} />
    </Switch>
  );
};
