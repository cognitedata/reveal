import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, Overline } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { getSuitesTableState } from 'store/suites/selectors';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import NavigationItem from './NavigationItem';
import {
  TitleContainer,
  AvailableSuitesContainer,
  CollapseButton,
  SidebarContainer,
} from './elements';

const LeftSidebar: React.FC = () => {
  const { suites } = useSelector(getSuitesTableState);
  const metrics = useMetrics('LeftSidebar');

  const sideBarState = JSON.parse(
    localStorage.getItem('sideBarState') || 'true' // TODO(DTC-215) store in state
  );
  const [isOpen, setOpen] = useState(sideBarState);

  useEffect(() => {
    localStorage.setItem('sideBarState', JSON.stringify(isOpen));
  }, [isOpen]);

  const handleHideSidebar = () => {
    metrics.track(isOpen ? 'Hide' : 'Show');
    setOpen(() => !isOpen);
  };

  const renderNavigationItem = (item: Suite) => (
    <NavLink
      to={`/suites/${item.key}`}
      key={item.key}
      onClick={() =>
        metrics.track('Suite_Click', { suiteKey: item.key, suite: item.title })
      }
    >
      <NavigationItem dataItem={item} />
    </NavLink>
  );

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
