import React, { useContext } from 'react';
import { Button, Colors, Flex, Title } from '@cognite/cogs.js';
import { Drawer } from 'antd';

import { RawExplorerContext } from 'contexts';

const SIDEBAR_PROFILING_WIDTH = 350;

export const ProfilingSidebar = (): JSX.Element => {
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen, selectedColumn } =
    useContext(RawExplorerContext);

  const onClickHide = () => {
    setIsProfilingSidebarOpen(false);
  };

  return (
    <Drawer
      visible={isProfilingSidebarOpen}
      width={SIDEBAR_PROFILING_WIDTH}
      placement="right"
      closable={false}
      getContainer={false}
      mask={false}
      onClose={onClickHide}
      style={{
        position: 'absolute',
        borderTop: `1px solid ${Colors['greyscale-grey3'].hex()}`,
      }}
      footer={
        <Button block icon="PanelRight" type="secondary" onClick={onClickHide}>
          Hide
        </Button>
      }
    >
      <Flex>
        <Title level={6}>{selectedColumn?.title ?? '-'}</Title>
      </Flex>
    </Drawer>
  );
};
