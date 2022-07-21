import { Flex, Label } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import styled from 'styled-components';
import { ColumnDataType } from '../core/types';

const LIMIT = 4;

export const ListCellRenderer = React.memo(
  ({ value, colDef }: ICellRendererParams) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [_, realType] = colDef?.type;
    return value
      .splice(0, LIMIT)
      .map((item: any, index: number, items: any) => {
        if (index !== 0) return null;
        return (
          <Flex justifyContent={'space-between'} key={index}>
            <ListCellValueText>
              {printType(item, realType)};...
            </ListCellValueText>
            <Label size="small" variant="normal">
              {items.length}
            </Label>
          </Flex>
        );
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

const ListCellValueText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
`;
