import React from 'react';
import ReactBaseTable, { Column } from 'react-base-table';

import styled from 'styled-components';

import { AnnotationRenderer } from '../../Containers/FileTableRenderers/AnnotationRenderer';
import { NameRenderer } from '../../Containers/FileTableRenderers/NameRenderer';
import { StringHeaderRenderer } from '../../Containers/FileTableRenderers/StringHeaderRenderer';
import { VisionFile } from '../../store/files/types';
import { TableWrapper } from '../FileTable/FileTableWrapper';

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
