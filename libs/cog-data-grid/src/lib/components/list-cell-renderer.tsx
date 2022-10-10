import { Flex, Label } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import styled from 'styled-components';
import { ColumnDataType } from '../core/types';

interface IListCellRendererProps extends ICellRendererParams {
  listDataType: ColumnDataType;
}

export const ListCellRenderer = React.forwardRef(
  (props: IListCellRendererProps, _) => {
    const items = Array.isArray(props.value) ? props.value : [];

    return (
      <Flex justifyContent={'space-between'}>
        <ListCellValueText>
          {items.length
            ? `${printType(items[0], props.listDataType)};...`
            : ' '}
        </ListCellValueText>
        <Label size="small" variant="normal">
          {items.length || '0'}
        </Label>
      </Flex>
    );
  }
);

const printType = (value: any, type: ColumnDataType) => {
  switch (type) {
    case ColumnDataType.Decimal:
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    default:
      return value.toString();
  }
};

const ListCellValueText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
`;
