import React, { useContext } from 'react';
import { Button, Drawer, Flex } from '@cognite/cogs.js';

import { RawExplorerContext } from 'contexts';

export const ProfilingSidebar = (): JSX.Element => {
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen } =
    useContext(RawExplorerContext);

  const onClickHide = () => {
    setIsProfilingSidebarOpen(false);
  };

  return (
    <Drawer
      visible={isProfilingSidebarOpen}
      onOk={onClickHide}
      onClose={onClickHide}
      width={350}
      footer={
        <Button block icon="PanelRight" type="secondary" onClick={onClickHide}>
          Hide
        </Button>
      }
    >
      <Flex>^_^</Flex>
    </Drawer>
  );
};
