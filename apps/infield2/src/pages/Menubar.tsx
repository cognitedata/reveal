import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';

import { SidebarIcon } from './Sidebar';
import { MenubarComments } from './MenubarComments';

export enum PAGES {
  HOME = '/home',
  INFO = '/info',
  SDK = '/sdk',
  INTERCOM = '/intercom',
  COMMENTS = '/comments',
  COMMENTS_DRAWER = '/comments/drawer',
  COMMENTS_SLIDER = '/comments/slider',
  LOGOUT = '/logout',
}

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = React.useState<string>(PAGES.HOME);

  const handleNavigate = (page: PAGES) => () => {
    setActive(page);
    history.push(page);
  };

  useEffect(() => {
    // setup initial selection on page load
    // (this is a bit hack perhaps, please modify for your own routes)
    setActive(`/${window.location.pathname.split('/')[2]}`);
  }, []);

  return (
    <TopBar data-testid="top-bar">
      <TopBar.Left>
        <Link to={PAGES.HOME}>
          <TopBar.Logo title="InField 2.0" />
        </Link>
      </TopBar.Left>
      <TopBar.Navigation
        links={[
          {
            name: 'Home',
            isActive: active === PAGES.HOME,
            onClick: handleNavigate(PAGES.HOME),
          },
          {
            name: 'Sidecar Info',
            isActive: active === PAGES.INFO,
            onClick: handleNavigate(PAGES.INFO),
          },
          {
            name: 'Cognite SDK',
            isActive: active === PAGES.SDK,
            onClick: handleNavigate(PAGES.SDK),
          },
          {
            name: 'Comments',
            isActive: active === PAGES.COMMENTS,
            onClick: handleNavigate(PAGES.COMMENTS),
          },
          {
            name: 'Intercom',
            isActive: active === PAGES.INTERCOM,
            onClick: handleNavigate(PAGES.INTERCOM),
          },
        ]}
      />
      <MenubarComments PAGES={PAGES} handleNavigate={handleNavigate} />
      <TopBar.Right>
        <SidebarIcon />
      </TopBar.Right>
    </TopBar>
  );
};
