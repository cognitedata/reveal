import { Switch, Redirect, Route } from 'react-router-dom-v5';
import { NotFoundPage } from 'pages/App/NotFoundPage';
import { Home } from 'pages/App/Home';
import { Profile } from 'pages/App/Profile';
import { Logout } from '@cognite/react-container';
import { usePageSettings } from 'hooks/usePageSettings';
import { Page } from 'components/Page';

import { PAGES } from '../constants';

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
        <Redirect exact from="/" to={PAGES.HOME} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </Page>
  );
};
