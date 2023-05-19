import React, { ReactNode } from 'react';
import { Body, Button, Flex, Tooltip, TooltipProps } from '@cognite/cogs.js';
import { ColumnType, SortOrder } from 'antd/lib/table/interface';
import styled from 'styled-components';

import { TOOLTIP_DELAY_IN_MS } from '../..';

type TableColumnTitleProps<RecordType> = {
  _key: ColumnType<RecordType>['key'];
  appendTo: TooltipProps['appendTo'];
  onClick?: (key: ColumnType<RecordType>['key']) => void;
  title: ReactNode;
} & Pick<ColumnType<RecordType>, 'sorter' | 'sortOrder'>;

export const TableColumnTitle = <RecordType extends Record<string, unknown>>({
  _key,
  onClick,
  sorter,
  sortOrder,
  title,
  appendTo,
}: TableColumnTitleProps<RecordType>): JSX.Element => {
  const getSortIcon = (sortOrder?: SortOrder) => {
    switch (sortOrder) {
      case 'ascend':
        return 'ReorderAscending';
      case 'descend':
        return 'ReorderDescending';
      default:
        return 'ReorderDefault';
    }
  };

  const getSortTooltip = (sortOrder?: SortOrder) => {
    switch (sortOrder) {
      case 'ascend':
        return 'Sort descending';
      case 'descend':
        return 'Reset sort';
      default:
        return 'Sort ascending';
    }
  };

  return (
    <StyledTableColumnTitleContainer>
      <Flex gap={2} alignItems="center">
        <Body level={2}>{title}</Body>
        {sorter ? (
          <Tooltip
            content={getSortTooltip(sortOrder)}
            delay={TOOLTIP_DELAY_IN_MS}
            appendTo={appendTo}
          >
            <StyledColumnSortButton
              onClick={() => (onClick && _key ? onClick(_key) : undefined)}
              icon={getSortIcon(sortOrder)}
              size="small"
              toggled={!!sortOrder}
              type="ghost"
            />
          </Tooltip>
        ) : (
          <>{null}</>
        )}
      </Flex>
    </StyledTableColumnTitleContainer>
  );
};

const StyledTableColumnTitleContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledColumnSortButton = styled(Button)`
  margin-left: 4px;
  cursor: pointer !important;
`;
