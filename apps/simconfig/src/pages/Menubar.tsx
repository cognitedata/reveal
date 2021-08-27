import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';

import { SidebarIcon } from './Sidebar';

export const PAGES = {
  HOMEPAGE: '/homepage',
  LOGOUT: '/logout',
};

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = React.useState<string>(PAGES.HOMEPAGE);

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
        <TopBar.Logo title="Simulator Configuration" />
      </TopBar.Left>
      <TopBar.Navigation
        links={[
          {
            name: 'Homepage',
            isActive: active === PAGES.HOMEPAGE,
            onClick: handleNavigate(PAGES.HOMEPAGE),
          },
        ]}
      />
      <TopBar.Right>
        <SidebarIcon />
      </TopBar.Right>
    </TopBar>
  );
};
