import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';

import { SidebarIcon } from './Sidebar';

export enum PAGES {
  HOME = '/home',
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
          <TopBar.Logo title="Explorer" />
        </Link>
      </TopBar.Left>
      <TopBar.Navigation
        links={[
          {
            name: 'Home',
            isActive: active === PAGES.HOME,
            onClick: handleNavigate(PAGES.HOME),
          },
        ]}
      />
      <TopBar.Right>
        <SidebarIcon />
      </TopBar.Right>
    </TopBar>
  );
};
