import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { Drawer } from 'antd';

import { Body, Button, Colors, Title, Tooltip } from '@cognite/cogs.js';

import ColumnIcon from 'components/ColumnIcon';
import { RawExplorerContext } from 'contexts';
import { useColumnNavigation } from 'hooks/table-navigation';
import { useColumnSelection } from 'hooks/table-selection';
import { useColumnType } from 'hooks/column-type';

const SIDEBAR_PROFILING_WIDTH = 350;
const CLOSE_BUTTON_SPACE = 64;

export const ProfilingSidebar = (): JSX.Element => {
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen } =
    useContext(RawExplorerContext);
  const { canNavigate, onPrevColumnClick, onNextColumnClick } =
    useColumnNavigation();
  const { selectedColumn } = useColumnSelection();
  const { getColumnType } = useColumnType();

  const columnType = useMemo(
    () => getColumnType(selectedColumn?.title),
    [getColumnType, selectedColumn]
  );

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
          <Tooltip content={selectedColumn?.title}>
            <Title
              level={6}
              style={{
                flex: '1 1 50%',
                textAlign: 'center',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedColumn?.title ?? '—'}
            </Title>
          </Tooltip>
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
      <StyledDrawerSectionColumnType>
        <Body level={2} strong>
          Type
        </Body>
        <ColumnIcon title={selectedColumn?.title} />
        <Body level={2} style={{ fontWeight: 400, marginLeft: '4px' }}>
          {columnType}
        </Body>
      </StyledDrawerSectionColumnType>
    </Drawer>
  );
};

const StyledDrawerSection = styled.div`
  display: flex;
  padding: 8px 16px;
  width: 100%;
  padding: 8px 16px;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
`;

const StyledDrawerHeader = styled(StyledDrawerSection)`
  justify-content: space-between;
  align-items: center;
`;

const StyledDrawerHeaderSectionTitle = styled.div`
  display: flex;
  flex: 1 1 auto;
  max-width: ${SIDEBAR_PROFILING_WIDTH - CLOSE_BUTTON_SPACE}px;
  align-items: center;
  justify-content: space-between;
  margin-right: 8px;
`;

const StyledDrawerSectionColumnType = styled(StyledDrawerSection)`
  padding: 16px;
  align-items: center;
  justify-content: flex-start;
  color: ${Colors['greyscale-grey7'].hex()};
  & > :first-child {
    width: 90px;
  }
`;
