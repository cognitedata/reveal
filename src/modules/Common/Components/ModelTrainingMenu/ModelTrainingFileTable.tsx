import React from 'react';
import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import styled from 'styled-components';
import ReactBaseTable, { Column } from 'react-base-table';
import { StringHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringHeaderRenderer';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { VisionFile } from 'src/modules/Common/store/files/types';

export type ModelTrainingFileTableDataType = {
  file: VisionFile[];
  annotations: JSX.Element;
};

export const ModelTrainingFileTable = ({ data }: { data: VisionFile[] }) => {
  const columns = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
      sortable: true,
    },
    {
      key: 'annotations',
      title: 'Annotations',
      dataKey: 'annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.LEFT,
      sortable: true,
    },
  ];

  const Cell = (cellProps: any) => {
    const renderer =
      cellProps.column.dataKey === 'annotations'
        ? AnnotationRenderer
        : NameRenderer;
    return renderer(cellProps);
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
          width={400}
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
