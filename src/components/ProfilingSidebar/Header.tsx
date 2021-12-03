import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';

import { Body, Button, Colors, Icon, Title, Tooltip } from '@cognite/cogs.js';

import { RawExplorerContext, useActiveTableContext } from 'contexts';
import { ColumnType } from 'hooks/table-data';
import { useColumnNavigation } from 'hooks/table-navigation';
import { useColumnType } from 'hooks/profiling-service';
import {
  SIDEBAR_PROFILING_DRAWER_WIDTH,
  SIDEBAR_PROFILING_CLOSE_BUTTON_SPACE,
} from 'utils/constants';
import ColumnIcon from 'components/ColumnIcon';

type Props = { selectedColumn: ColumnType | undefined };

export const Header = ({ selectedColumn }: Props) => {
  const { setIsProfilingSidebarOpen } = useContext(RawExplorerContext);
  const { database, table } = useActiveTableContext();
  const { getColumnType, isFetched } = useColumnType(database, table);
  const { canNavigate, onPrevColumnClick, onNextColumnClick } =
    useColumnNavigation();

  const columnType = useMemo(
    () => (isFetched ? getColumnType(selectedColumn?.dataKey) : null),
    [getColumnType, selectedColumn, isFetched]
  );

  const onClickHide = () => setIsProfilingSidebarOpen(false);

  return (
    <React.Fragment>
      <StyledDrawerHeader>
        <StyledDrawerHeaderSectionTitle>
          {canNavigate && (
            <Button
              size="small"
              variant="ghost"
              icon="ChevronLeft"
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
              icon="ChevronRight"
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
        <ColumnIcon dataKey={selectedColumn?.dataKey} />
        <Body level={2} style={{ fontWeight: 400, marginLeft: '4px' }}>
          {columnType}
        </Body>
      </StyledDrawerSectionColumnType>
    </React.Fragment>
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
  max-width: ${SIDEBAR_PROFILING_DRAWER_WIDTH -
  SIDEBAR_PROFILING_CLOSE_BUTTON_SPACE}px;
  align-items: center;
  justify-content: space-between;
  margin-right: 8px;
`;

const StyledDrawerSectionColumnType = styled(StyledDrawerSection)`
  padding: 16px;
  align-items: center;
  justify-content: flex-start;
  color: ${Colors['greyscale-grey7'].hex()};
  border-bottom: none;
  & > :first-child {
    width: 90px;
  }
`;
