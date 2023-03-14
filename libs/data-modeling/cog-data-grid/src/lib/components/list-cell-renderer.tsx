import { Flex, Icon } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import styled from 'styled-components';
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
    <Flex justifyContent="space-between" alignItems="center" gap={2}>
      <Flex alignItems="center" gap={4}>
        {props.listDataType === 'CUSTOM' && props.value.length > 0 ? (
          <Icon type="Link" />
        ) : null}
        <ListCellValueText>{getText()}</ListCellValueText>
      </Flex>
      {props.value.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          <Icon type="List" />
        </div>
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
