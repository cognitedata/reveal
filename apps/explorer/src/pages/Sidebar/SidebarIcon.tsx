import React from 'react';
import { TopBar, Icon } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

import { Sidebar } from './Sidebar';

const TopBarActions = styled(TopBar.Actions)`
  border-right: none;
`;

export const SidebarIcon: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const closePanel = () => {
    setDrawerOpen(false);
  };

  const openPanel = () => {
    setDrawerOpen(true);
  };

  return (
    <>
      <TopBarActions
        actions={[
          {
            component: (
              <Icon type="Settings" key={2} aria-label="Open sidebar" />
            ),
            key: 'settings',
            onClick: openPanel,
          },
        ]}
      />

      <Sidebar isOverlayOpened={drawerOpen} onCancel={closePanel} />
    </>
  );
};
