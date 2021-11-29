import React, { useContext } from 'react';
import styled from 'styled-components';
import { Drawer } from 'antd';

import { Button, Colors, Title } from '@cognite/cogs.js';

import { RawExplorerContext } from 'contexts';
import { useColumnNavigation } from 'hooks/table-navigation';
import { useColumnSelection } from 'hooks/table-selection';

const SIDEBAR_PROFILING_WIDTH = 350;

export const ProfilingSidebar = (): JSX.Element => {
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen } =
    useContext(RawExplorerContext);
  const { canNavigate, onPrevColumnClick, onNextColumnClick } =
    useColumnNavigation();
  const { selectedColumn } = useColumnSelection();

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
      bodyStyle={{ padding: 0 }}
      footer={
        <Button block icon="PanelRight" type="secondary" onClick={onClickHide}>
          Hide
        </Button>
      }
    >
      <StyledDrawerHeader>
        <StyledDrawerHeaderSectionTitle>
          {canNavigate && (
            <Button
              size="small"
              variant="ghost"
              icon="ChevronLeftCompact"
              onClick={onPrevColumnClick}
            />
          )}
          <Title level={6} style={{ flex: '1 1 auto', textAlign: 'center' }}>
            {selectedColumn?.title ?? '—'}
          </Title>
          {canNavigate && (
            <Button
              size="small"
              variant="ghost"
              icon="ChevronRightCompact"
              onClick={onNextColumnClick}
            />
          )}
        </StyledDrawerHeaderSectionTitle>
        <Button
          size="small"
          variant="ghost"
          icon="Close"
          onClick={onClickHide}
        />
      </StyledDrawerHeader>
    </Drawer>
  );
};

const StyledDrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
`;

const StyledDrawerHeaderSectionTitle = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  margin-right: 8px;
`;
