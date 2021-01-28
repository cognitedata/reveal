import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, Overline } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { getSuitesTableState } from 'store/suites/selectors';
import { TS_FIX_ME } from 'types/core';
import NavigationItem from './NavigationItem';
import {
  TitleContainer,
  AvailableSuitesContainer,
  CollapseButton,
  SidebarContainer,
} from './elements';

interface NavigationItem {
  title: string;
  color: string;
  key: string;
}

const renderNavigationItem = (
  item: NavigationItem,
  disabled?: boolean,
  location?: TS_FIX_ME
) => (
  <NavLink to={`/suites/${item.key}`} key={item.key}>
    <NavigationItem
      title={item.title}
      key={item.key}
      selected={location?.pathname?.startsWith(`/suites/${item.key}`)}
      color={item.color}
      data-testid={`NavigationItem-${item.title}`}
      disabled={disabled}
    />
  </NavLink>
);

const LeftSidebar: React.FC = () => {
  const { suites } = useSelector(getSuitesTableState);
  const location = useLocation();

  const sideBarState = JSON.parse(
    localStorage.getItem('sideBarState') || 'true'
  );
  const [isOpen, setOpen] = useState(sideBarState);

  useEffect(() => {
    localStorage.setItem('sideBarState', JSON.stringify(isOpen));
  }, [isOpen]);

  const handleHideSidebar = () => {
    setOpen(() => !isOpen);
  };

  return (
    <SidebarContainer open={isOpen}>
      <CollapseButton open={isOpen} onClick={handleHideSidebar}>
        <Icon type={isOpen ? 'LargeLeft' : 'LargeRight'} />
      </CollapseButton>
      <TitleContainer>
        <Overline level={2}>Suites</Overline>
      </TitleContainer>
      <AvailableSuitesContainer>
        {suites?.map((suite: NavigationItem) =>
          renderNavigationItem(suite, false, location)
        )}
      </AvailableSuitesContainer>
    </SidebarContainer>
  );
};

export default LeftSidebar;
