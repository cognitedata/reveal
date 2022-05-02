import { Tag } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import styled from 'styled-components';
import { ColumnDataType } from '../core/types';

const LIMIT = 4;

export const ListCellRenderer = React.memo(
  ({ value, colDef }: ICellRendererParams) => {
    const diff = value.length - LIMIT;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [_, realType] = colDef?.type;
    return value
      .splice(0, LIMIT)
      .map((item: any, index: number, items: any) => {
        if (items.length === index + 1 && diff > 0) {
          return <StyledTag>+{diff}</StyledTag>;
        }
        return <StyledTag key={index}>{printType(item, realType)}</StyledTag>;
      });
  }
);

const printType = (value: any, type: ColumnDataType) => {
  switch (type) {
    case ColumnDataType.Number:
    case ColumnDataType.Decimal:
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    default:
      return value;
  }
};

const StyledTag = styled(Tag)`
  margin-right: 4px;
  border-radius: 4px;
`;
