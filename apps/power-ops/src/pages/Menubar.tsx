import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';
import { LogoutButton } from '@cognite/react-container';

import { StyledTopBar, LogoContainer, LogOutButtonContainer } from './elements';

export enum PAGES {
  HOME = '/home',
  EVENTS = '/events',
  DEMO = '/demo',
  PORTFOLIO = '/portfolio',
  LOGOUT = '/logout',
}

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = React.useState<string>(PAGES.DEMO);

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
    return history.listen((location) => {
      setActive(`/${location.pathname}`);
    });
  }, [history.location]);

  return (
    <StyledTopBar data-testid="top-bar">
      <TopBar.Left>
        <Link to={PAGES.DEMO} onClick={handleNavigate(PAGES.DEMO)}>
          <LogoContainer>
            <TopBar.Logo title="Cognite Power Markets" />
          </LogoContainer>
        </Link>
        <TopBar.Navigation
          links={[
            {
              name: 'Demo',
              isActive: active === PAGES.DEMO,
              onClick: handleNavigate(PAGES.DEMO),
            },
            {
              name: 'Portfolio',
              isActive: active === PAGES.PORTFOLIO,
              onClick: handleNavigate(PAGES.PORTFOLIO),
            },
            {
              name: 'SSE Events',
              isActive: active === PAGES.EVENTS,
              onClick: handleNavigate(PAGES.EVENTS),
            },
          ]}
        />
      </TopBar.Left>
      <TopBar.Right>
        <LogOutButtonContainer>
          <LogoutButton handleClick={handleClick} />
        </LogOutButtonContainer>
      </TopBar.Right>
    </StyledTopBar>
  );
};
