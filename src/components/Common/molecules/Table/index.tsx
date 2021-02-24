import { Table as AntdTable } from 'antd';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Table = styled(AntdTable)`
  .ant-table-thead
    > tr
    > th
    .ant-table-header-column
    .ant-table-column-sorters:hover::before {
    background-color: transparent;
  }
  .ant-table-thead > tr > th:hover,
  .ant-table-thead > tr > th.ant-table-column-sort,
  .ant-table-tbody
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td {
    background-color: ${Colors['midblue-8'].hex()};
  }
  th {
    background-color: ${Colors.white.hex()};
  }
  td {
    cursor: pointer;
  }
`;
