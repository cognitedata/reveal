import { useHistory, Link, useLocation } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';
import React from 'react';

export enum PAGES {
  HOME = '/home',
  SEARCH = '/search',
}

export const MenuBar = () => {
  const history = useHistory();
  const { pathname } = useLocation();

  const handleNavigate = (page: PAGES) => () => {
    history.push(page);
  };

  return (
    <TopBar data-testid="top-bar">
      <TopBar.Left>
        <Link to={PAGES.HOME}>
          <TopBar.Logo title="Asset Inspector" />
        </Link>
      </TopBar.Left>

      <TopBar.Navigation
        style={{ backgroundColor: 'red' }}
        links={[
          {
            name: 'Home',
            isActive: pathname === PAGES.HOME,
            onClick: handleNavigate(PAGES.HOME),
          },
          {
            name: 'Search',
            isActive: pathname === PAGES.SEARCH,
            onClick: handleNavigate(PAGES.SEARCH),
          },
        ]}
      />

      {/* <MenubarComments PAGES={PAGES} handleNavigate={handleNavigate} /> */}
      {/* <TopBar.Right> */}
      {/*  <SidebarIcon /> */}
      {/* </TopBar.Right> */}
    </TopBar>
  );
};
