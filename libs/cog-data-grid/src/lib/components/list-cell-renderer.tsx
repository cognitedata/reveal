import { Flex, Icon, Label } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import styled from 'styled-components';
import { ColumnDataType } from '../core/types';

interface IListCellRendererProps extends ICellRendererParams {
  listDataType: ColumnDataType;
}

export const ListCellRenderer = React.forwardRef(
  (props: IListCellRendererProps, _) => {
    return (
      <Flex justifyContent={'space-between'}>
        <ListCellValueText>
          {props.value.length
            ? `${printType(props.value[0], props.listDataType)};...`
            : ' '}
        </ListCellValueText>
        {props.value.length > 1 && <Icon type="List" />}
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
    case 'CUSTOM':
      return value.externalId;
    default:
      return value.toString();
  }
};

const ListCellValueText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
`;
