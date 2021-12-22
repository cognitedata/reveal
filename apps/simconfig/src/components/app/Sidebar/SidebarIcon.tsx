import React from 'react';

import styled from 'styled-components/macro';

import { Icon, TopBar } from '@cognite/cogs.js';

import { Sidebar } from './Sidebar';

const TopBarActions = styled(TopBar.Actions)`
  border-right: none;
`;

export function SidebarIcon() {
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);

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
            component: <Icon key={2} type="Settings" />,
            key: 'settings',
            onClick: openPanel,
          },
        ]}
      />

      <Sidebar isOverlayOpened={isDrawerOpen} onCancel={closePanel} />
    </>
  );
}
