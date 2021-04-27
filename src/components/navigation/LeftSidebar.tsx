import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { A, Icon, Overline } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { getSuitesTableState } from 'store/suites/selectors';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import { ApplicationItem } from 'store/config/types';
import { getApplications } from 'store/config/selectors';
import SuiteNavigationItem from './SuiteNavigationItem';
import ApplicationNavigationItem from './ApplicationNavigationItem';
import {
  TitleContainer,
  ItemsContainer,
  CollapseButton,
  SidebarContainer,
} from './elements';

const LeftSidebar: React.FC = () => {
  const { suites } = useSelector(getSuitesTableState);
  const applications = useSelector(getApplications);
  const metrics = useMetrics('LeftSidebar');

  const sideBarState = JSON.parse(
    localStorage.getItem('sideBarState') || 'true' // TODO(DTC-215) store in state
  );
  const [isOpen, setOpen] = useState(sideBarState);

  useEffect(() => {
    localStorage.setItem('sideBarState', JSON.stringify(isOpen));
  }, [isOpen]);

  if (!suites || suites.length === 0) {
    // No suites? Lets remove this sidebar until we add some.
    return null;
  }

  const handleHideSidebar = () => {
    metrics.track(isOpen ? 'Hide' : 'Show');
    setOpen(() => !isOpen);
  };

  const renderApplicationItem = (item: ApplicationItem) => (
    <A
      href={item.url}
      key={item.key}
      target="_blank"
      onClick={() =>
        metrics.track('Application_Click', {
          key: item.key,
          application: item.title,
        })
      }
    >
      <ApplicationNavigationItem item={item} />
    </A>
  );

  const renderSuiteNavigationItem = (item: Suite) => (
    <NavLink
      to={`/suites/${item.key}`}
      key={item.key}
      onClick={() =>
        metrics.track('Suite_Click', { suiteKey: item.key, suite: item.title })
      }
    >
      <SuiteNavigationItem dataItem={item} />
    </NavLink>
  );

  return (
    <SidebarContainer open={isOpen}>
      <CollapseButton
        className="collapse-button"
        open={isOpen}
        onClick={handleHideSidebar}
      >
        <Icon
          type={isOpen ? 'LargeLeft' : 'LargeRight'}
          style={{ width: 12 }}
        />
      </CollapseButton>
      {!!applications.length && (
        <>
          <TitleContainer>
            <Overline level={2}>Applications</Overline>
          </TitleContainer>
          <ItemsContainer>
            {applications.map((item) => renderApplicationItem(item))}
          </ItemsContainer>
        </>
      )}
      <TitleContainer>
        <Overline level={2}>Suites</Overline>
      </TitleContainer>
      <ItemsContainer>
        {suites?.map((suite) => renderSuiteNavigationItem(suite))}
      </ItemsContainer>
    </SidebarContainer>
  );
};

export default LeftSidebar;
