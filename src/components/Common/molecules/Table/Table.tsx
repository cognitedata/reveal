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
  };
}

export const Table = styled(AntdTable)<CustomTableProps>`
  .ant-table {
    background: ${(props) =>
      props.options?.secondary
        ? Colors['greyscale-grey1'].hex()
        : Colors.white.hex()};
  }
  .ant-table-thead
    > tr
    > th
    .ant-table-header-column
    .ant-table-column-sorters:hover::before {
    background-color: transparent;
  }
  .ant-table-thead > tr > th:hover,
  .ant-table-thead > tr > th.ant-table-column-sort,
  .ant-table-tbody > tr > td {
    padding: ${(props) => (props.options?.narrow ? '0 16px' : '16px')};
    height: 30px;
  }
  .ant-table-tbody
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td {
    background-color: ${(props) =>
      props.options?.secondary
        ? Colors['greyscale-grey2'].hex()
        : Colors['midblue-8'].hex()};
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
    cursor: pointer;
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
