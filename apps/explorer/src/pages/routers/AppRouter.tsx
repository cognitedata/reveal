import { Switch, Redirect, Route } from 'react-router-dom';
import { NotFoundPage } from 'pages/NotFoundPage';
import { Home } from 'pages/Home';
import { Logout } from '@cognite/react-container';
import { PAGES } from 'components/Menubar';

// Refactor https://dev.to/surajjadhav/how-should-we-structure-our-react-code-2-2-kgh
export const AppRouter = () => {
  return (
    <Switch>
      <Route path={PAGES.HOME} render={() => <Home />} />
      <Route path={PAGES.LOGOUT} render={() => <Logout />} />

      <Redirect from="" to={PAGES.HOME} />
      <Redirect from="/" to={PAGES.HOME} />
      <Route render={() => <NotFoundPage />} />
    </Switch>
  );
};
