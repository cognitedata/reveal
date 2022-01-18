import React from 'react';
import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import styled from 'styled-components';
import ReactBaseTable from 'react-base-table';

export type BulkEditTableDataType = {
  name: string;
  original: JSX.Element;
  updated: JSX.Element;
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
  max-height: 360px;
  overflow: auto;
  .BaseTable__row-cell-text {
    white-space: normal !important;
  }
`;
