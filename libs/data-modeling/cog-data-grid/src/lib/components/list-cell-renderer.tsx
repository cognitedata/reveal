import styled from 'styled-components';

import { ICellRendererParams } from 'ag-grid-community';

import { Flex, Icon } from '@cognite/cogs.js';

import { ColumnDataType } from '../core/types';

interface IListCellRendererProps extends ICellRendererParams {
  listDataType: ColumnDataType;
}

export const ListCellRenderer = (props: IListCellRendererProps) => {
  const getText = () => {
    if (props.value.length === 0) return '';

    const baseText = `${printType(props.value[0], props.listDataType)}`;

    if (props.value.length > 1) {
      return `${baseText};...`;
    }

    return baseText;
  };

  return (
    <Flex>
      {props.listDataType === 'CUSTOM' && props.value.length > 0 ? (
        <Flex style={{ flexShrink: 0, marginRight: '4px' }} alignItems="center">
          <Icon type="Link" />
        </Flex>
      ) : null}
      <ListCellValueText>{getText()}</ListCellValueText>
      {props.value.length > 0 && (
        <Flex alignItems="center" style={{ marginLeft: 'auto' }}>
          <Icon type="List" />
        </Flex>
      )}
    </Flex>
  );
};

const printType = (value: any, type: ColumnDataType) => {
  switch (type) {
    case ColumnDataType.Decimal:
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    case ColumnDataType.Custom:
      return value.externalId;
    case ColumnDataType.Json:
      return JSON.stringify(value);
    default:
      return value.toString();
  }
};

const ListCellValueText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
`;
