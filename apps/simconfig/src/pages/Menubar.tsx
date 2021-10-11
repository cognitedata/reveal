import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';
import { SimulatorStatus } from 'components/simulator/SimulatorStatus';

import { SidebarIcon } from './Sidebar';

export const PAGES = {
  MODEL_LIBRARY: '/model-library',
  MODEL_LIBRARY_NEW: '/model-library/new',
  MODEL_LIBRARY_VERSION: '/model-library/:modelName',
  MODEL_LIBRARY_VERSION_NEW: '/model-library/:modelName/version-new',
  LOGOUT: '/logout',
};

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = React.useState<string>(PAGES.MODEL_LIBRARY);

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
            name: 'Model library',
            isActive: active === PAGES.MODEL_LIBRARY,
            onClick: handleNavigate(PAGES.MODEL_LIBRARY),
          },
        ]}
      />
      <TopBar.Right>
        <TopBar.Item style={{ padding: '0 24px' }}>
          <SimulatorStatus />
        </TopBar.Item>
        <SidebarIcon />
      </TopBar.Right>
    </TopBar>
  );
};
