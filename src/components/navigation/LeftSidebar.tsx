import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Icon, Overline } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { getSuitesTableState } from 'store/suites/selectors';
import { Suite } from 'store/suites/types';
import NavigationItem from './NavigationItem';
import {
  TitleContainer,
  AvailableSuitesContainer,
  CollapseButton,
  SidebarContainer,
} from './elements';

const renderNavigationItem = (item: Suite) => (
  <NavLink to={`/suites/${item.key}`} key={item.key}>
    <NavigationItem dataItem={item} />
  </NavLink>
);

const LeftSidebar: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation('Home');
  const { suites } = useSelector(getSuitesTableState);

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
        {suites?.map((suite) => renderNavigationItem(suite))}
      </AvailableSuitesContainer>
    </SidebarContainer>
  );
};

export default LeftSidebar;
