import React from 'react';
import styled from 'styled-components';
import ReactBaseTable from 'react-base-table';
import { TableWrapper } from '../../FileTable/FileTableWrapper';

export type BulkEditTableDataType = {
  name: string;
  original: string;
  updated: string;
};

export const BulkEditTable = ({
  data,
  columns,
}: {
  data: BulkEditTableDataType[];
  columns: any;
}) => (
  <TableContainer>
    <TableWrapper>
      <ReactBaseTable
        data={data}
        width={720}
        maxHeight={Infinity}
        columns={columns}
      />
    </TableWrapper>
  </TableContainer>
);

const TableContainer = styled.div`
  max-height: 380px;
  overflow: auto;
  .BaseTable__row-cell-text {
    white-space: normal !important;
  }
`;
