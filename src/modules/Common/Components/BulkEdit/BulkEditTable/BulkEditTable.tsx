import React from 'react';
import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import styled from 'styled-components';
import ReactBaseTable from 'react-base-table';
import { CellRenderer } from 'src/modules/Common/types';
import { StringHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringHeaderRenderer';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';

export type BulkEditTableDataType = {
  name: string;
  original?: JSX.Element;
  updated?: JSX.Element;
  id?: number;
  annotationFilter?: AnnotationFilterType;
};

export const BulkEditTable = ({
  data,
  columns,
  rendererMap,
}: {
  data: BulkEditTableDataType[];
  columns: any;
  rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element };
}) => {
  const Cell = (cellProps: any) => {
    // We use key instead of dataKey to get entries from the renderer map.
    // This is because for each table, the columns have the same column names
    // (e.g., original and updated)
    const renderer = rendererMap[cellProps.column.key];
    if (renderer) {
      return renderer(cellProps);
    }
    return StringRenderer(cellProps);
  };
  const HeaderCell = (cellProps: any) => {
    return StringHeaderRenderer(cellProps);
  };
  const components = {
    TableCell: Cell,
    TableHeaderCell: HeaderCell,
  };

  return (
    <TableContainer>
      <TableWrapper>
        <ReactBaseTable
          data={data}
          width={720}
          maxHeight={Infinity}
          columns={columns}
          components={components}
        />
      </TableWrapper>
    </TableContainer>
  );
};

const TableContainer = styled.div`
  max-height: 360px;
  overflow: auto;
  .BaseTable__row-cell-text {
    white-space: normal !important;
  }
`;
