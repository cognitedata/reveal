import React from 'react';
import { TableProps as AntdTableProps } from 'antd/lib/table';
import { Table as AntdTable } from 'antd';
import { Colors, Icon as CogsIcon } from '@cognite/cogs.js';
import styled from 'styled-components';

export interface CustomTableProps extends AntdTableProps<any> {
  options?: {
    secondary?: boolean;
    expandedRowPadding?: boolean;
    narrow?: boolean;
    pointer?: boolean;
  };
}

export const Table = styled(AntdTable)<CustomTableProps>`
  .ant-table {
    background: ${(props) =>
      props.options?.secondary
        ? Colors['greyscale-grey1'].hex()
        : Colors.white.hex()};

    tr > th.ant-table-selection-column,
    tr > td.ant-table-selection-column {
      padding: 0 16px;
    }
  }
  .ant-table-column-title {
    user-select: none;
  }
  .ant-table-thead
    > tr
    > th
    .ant-table-header-column
    .ant-table-column-sorters:hover::before {
    background-color: transparent;
  }
  .ant-table-thead > tr > th,
  .ant-table-thead > tr > th.ant-table-column-sort,
  .ant-table-tbody > tr > td {
    height: 30px;
    padding: ${(props) => (props.options?.narrow ? '12px' : '16px')};
  }
  .ant-table-thead
    > tr
    > th
    .ant-table-header-column
    .ant-table-column-sorters {
    padding: 0 8px;
  }
  .ant-table-tbody
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td {
    background-color: ${(props) =>
      props.options?.secondary
        ? Colors['greyscale-grey2'].hex()
        : Colors['midblue-8'].hex()};
  }
  .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
    width: 0;
  }
  tr.ant-table-row-level-0 td {
    border-top: 1px solid ${Colors['greyscale-grey2'].hex()};
    border-bottom: 0;
  }

  tr.ant-table-expanded-row > td {
    padding: ${(props) => (props.options?.expandedRowPadding ? '0 16px' : '0')};
  }
  th {
    background: ${(props) =>
      props.options?.secondary
        ? Colors['greyscale-grey1'].hex()
        : Colors.white.hex()};
  }
  td {
    cursor: ${(props) => (props.options?.pointer ? 'pointer' : 'default')};
  }
`;

type IconExpandProps = {
  record: any;
};

const Icon = styled(CogsIcon)`
  transition: all 0.3s ease-out;
  &.expanded {
    transform: rotate(90deg);
  }
`;
export function IconExpand(props: IconExpandProps) {
  const { expanded, onExpand } = props.record;
  return (
    <Icon
      type="ChevronRightCompact"
      className={expanded ? 'expanded' : ''}
      onClick={(e) => {
        onExpand(props.record, e);
      }}
    />
  );
}
