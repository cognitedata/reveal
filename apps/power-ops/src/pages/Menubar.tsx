import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';
import { LogoutButton } from '@cognite/react-container';

import { LogOutButtonContainer } from './elements';

export enum PAGES {
  HOME = '/home',
  HISTORICAL = '/historical',
  LOGOUT = '/logout',
}

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = React.useState<string>(PAGES.HOME);

  const handleNavigate = (page: PAGES) => () => {
    setActive(page);
    history.push(page);
  };

  function handleClick() {
    history.push('/logout');
  }

  useEffect(() => {
    // setup initial selection on page load
    // (this is a bit hack perhaps, please modify for your own routes)
    setActive(`/${window.location.pathname.split('/')[2]}`);
  }, []);

  return (
    <TopBar data-testid="top-bar">
      <TopBar.Left>
        <Link to={PAGES.HOME}>
          <TopBar.Logo title="Power Ops" />
        </Link>
        <TopBar.Navigation
          links={[
            {
              name: 'Home',
              isActive: active === PAGES.HOME,
              onClick: handleNavigate(PAGES.HOME),
            },
            {
              name: 'Historical',
              isActive: active === PAGES.HISTORICAL,
              onClick: handleNavigate(PAGES.HISTORICAL),
            },
          ]}
        />
      </TopBar.Left>
      <TopBar.Right>
        <LogOutButtonContainer>
          <LogoutButton handleClick={handleClick} />
        </LogOutButtonContainer>
      </TopBar.Right>
    </TopBar>
  );
};
