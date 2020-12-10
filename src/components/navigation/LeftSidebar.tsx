import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { Button, Icon, Input, Overline } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { getSuitesTableState } from 'store/suites/selectors';
import { colors } from 'constants/suiteColors';
import { TS_FIX_ME } from 'types/core';
import NavigationItem from './NavigationItem';
import {
  ActionContainer,
  AvailableSuitesContainer,
  CollapseButton,
  SidebarContainer,
  UnAvailableSuitesContainer,
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
) => {
  return (
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
};

const LeftSidebar: React.FC = () => {
  const { t } = useTranslation('Home');
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

  const BottomNavigation = [
    {
      key: '-ML7mCrzPkT1OA-a9IZh',
      title: t('Inspections') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      key: '-ML7mCrzPkT1OA-a9IZi',
      title: t('Maintenance Planner') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      key: '-ML7mCrzPkT1OA-a9IZj',
      title: t('Product Optimization') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
  ];

  return (
    <SidebarContainer open={isOpen}>
      <CollapseButton open={isOpen} onClick={handleHideSidebar}>
        <Icon type={isOpen ? 'LargeLeft' : 'LargeRight'} />
      </CollapseButton>
      <Input
        variant="noBorder"
        placeholder="Search for suites"
        icon="Search"
        iconPlacement="left"
        fullWidth
      />
      <ActionContainer>
        <Overline level={2}>All Suites</Overline>
        <Button
          type="secondary"
          variant="ghost"
          icon="Plus"
          iconPlacement="left"
        />
      </ActionContainer>
      <AvailableSuitesContainer>
        {suites?.map((suite: NavigationItem) =>
          renderNavigationItem(suite, false, location)
        )}
      </AvailableSuitesContainer>
      <UnAvailableSuitesContainer>
        {BottomNavigation.map((item) => renderNavigationItem(item, true))}
      </UnAvailableSuitesContainer>
    </SidebarContainer>
  );
};

export default LeftSidebar;
