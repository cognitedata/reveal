import React, { useContext } from 'react';
import styled from 'styled-components';
import { Drawer } from 'antd';

import { Button, Colors } from '@cognite/cogs.js';

import { RawExplorerContext } from 'contexts';
import { useColumnSelection } from 'hooks/table-selection';
import { SIDEBAR_PROFILING_DRAWER_WIDTH } from 'utils/constants';

import { Header } from './Header';

export const ProfilingSidebar = (): JSX.Element => {
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen } =
    useContext(RawExplorerContext);

  const { selectedColumn } = useColumnSelection();

  const onClickHide = () => setIsProfilingSidebarOpen(false);

  const footer = (
    <Button block icon="PanelRight" type="secondary" onClick={onClickHide}>
      Hide
    </Button>
  );

  return (
    <Drawer
      visible={isProfilingSidebarOpen}
      width={SIDEBAR_PROFILING_DRAWER_WIDTH}
      placement="right"
      closable={false}
      getContainer={false}
      mask={false}
      onClose={onClickHide}
      style={{
        position: 'absolute',
        borderTop: `1px solid ${Colors['greyscale-grey3'].hex()}`,
      }}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ padding: 0 }}
      title={<Header selectedColumn={selectedColumn} />}
      footer={footer}
    >
      <StyledDrawerSectionProfilingData>
        {/** todo */}
      </StyledDrawerSectionProfilingData>
    </Drawer>
  );
};

const StyledDrawerSectionProfilingData = styled.div`
  display: flex;
  padding: 8px 16px;
  width: 100%;
  padding: 8px 16px;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  flex-direction: column;
  flex: 1 1 auto;
  overflow: auto;
  border-bottom: none;
`;
