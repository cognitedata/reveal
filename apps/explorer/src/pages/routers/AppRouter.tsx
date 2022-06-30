import { Switch, Redirect, Route } from 'react-router-dom';
import { NotFoundPage } from 'pages/NotFoundPage';
import { Home } from 'pages/Home';
import { Profile } from 'pages/Profile';
import { Logout } from '@cognite/react-container';
import { usePageSettings } from 'hooks/usePageSettings';
import { Page } from 'components/Page';

import { PAGES } from './constants';

// Refactor https://dev.to/surajjadhav/how-should-we-structure-our-react-code-2-2-kgh
export const AppRouter = () => {
  const settings = usePageSettings();
  return (
    <Page isFullScreen={settings.isFullScreen}>
      <Switch>
        <Route path={PAGES.HOME} render={() => <Home />} />
        <Route path={PAGES.LOGOUT} render={() => <Logout />} />
        <Route path={PAGES.PROFILE} render={() => <Profile />} />
        <Route path={PAGES.NOT_FOUND} render={() => <NotFoundPage />} />

        <Redirect from="" to={PAGES.HOME} />
        <Redirect from="/" to={PAGES.HOME} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </Page>
  );
};
