import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';

import { SidebarIcon } from './Sidebar';

export const PAGES = {
  HOME: '/home',
  INFO: '/info',
  SDK: '/sdk',
  INTERCOM: '/intercom',
  LOGOUT: '/logout',
};

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = React.useState<string>(PAGES.HOME);

  const handleNavigate = (page: string) => () => {
    setActive(page);
    history.push(page);
  };

  useEffect(() => {
    // setup initial selection on page load
    // (this is a bit hack perhaps, please modify for your own routes)
    setActive(`/${window.location.pathname.split('/')[2]}`);
  }, []);

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo title="React Demo App" />
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
            name: 'Intercom',
            isActive: active === PAGES.INTERCOM,
            onClick: handleNavigate(PAGES.INTERCOM),
          },
        ]}
      />
      <TopBar.Right>
        <SidebarIcon />
      </TopBar.Right>
    </TopBar>
  );
};
