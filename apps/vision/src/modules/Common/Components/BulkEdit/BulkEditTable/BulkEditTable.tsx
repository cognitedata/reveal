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
  annotationThresholds?: [number, number]; // [rejectedThreshold, acceptedThreshold] in range [0, 1]
};

export const BulkEditTable = ({
  data,
  columns,
  rendererMap,
  disabled = false,
}: {
  data: BulkEditTableDataType[];
  columns: any;
  rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element };
  disabled?: boolean;
}) => {
  const Cell = (cellProps: any) => {
    // We use key instead of dataKey to get entries from the renderer map.
    // This is because for each table, the columns have the same column names
    // (e.g., original and updated)
    const renderer = rendererMap[cellProps.column.key];
    if (renderer) {
      return <PaddingContainer>{renderer(cellProps)}</PaddingContainer>;
    }
    return <PaddingContainer>{StringRenderer(cellProps)}</PaddingContainer>;
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
          /**
           * The minimum height for a row will be 33px when it only has the file name and image.
           * This estimated value will use to calculate the total height for the initial render.
           * Row height will dynamically change with the row content.
           */
          estimatedRowHeight={33}
          columns={columns}
          components={components}
          disabled={disabled}
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

const PaddingContainer = styled.div`
  padding: 10px 0px;
`;
