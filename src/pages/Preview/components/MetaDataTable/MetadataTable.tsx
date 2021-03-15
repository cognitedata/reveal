import styled from 'styled-components';
import { Input, Title } from '@cognite/cogs.js';
import React, { ReactText, useEffect } from 'react';
import { TableWrapper } from 'src/pages/Workflow/components/FileTable/FileTableWrapper';
import AutoSizer from 'react-virtualized-auto-sizer';
import { TableDataItem } from 'src/pages/Workflow/components/FileTable/FileTable';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';
import store from 'src/store';
import { fileMetaDataEdit } from 'src/store/previewSlice';

const Container = styled.div`
  height: 380px;
  width: 562px;
`;

const TitleHeader = styled.div`
  margin-bottom: 18px;
`;

export interface MetadataItem {
  key: string;
  value: ReactText;
}

type TableProps = Omit<Omit<BaseTableProps<TableDataItem>, 'width'>, 'height'>;

type MetadataTableProps = TableProps & {
  title: string;
  editMode: boolean;
  data: MetadataItem[];
};

const { dispatch } = store;
const updateCell = (value: any, cellProps: any) => {
  if (cellProps.columnIndex === 0) {
    // editing key
    dispatch(
      fileMetaDataEdit({
        index: cellProps.rowIndex,
        key: value,
        value: cellProps.rowData.value,
      })
    );
  } else if (cellProps.columnIndex === 1) {
    // editing value
    dispatch(
      fileMetaDataEdit({
        index: cellProps.rowIndex,
        key: cellProps.rowData.key,
        value,
      })
    );
  }
};

const EditableCell = (cellProps: {
  column: ColumnShape<MetadataItem>;
  cellData: ReactText;
}) => {
  const handleChange = (e: any) => {
    updateCell(e.target.value, cellProps);
  };
  if (cellProps.column.editMode) {
    return (
      <Input type="text" value={cellProps.cellData} onChange={handleChange} />
    );
  }
  return <span>{cellProps.cellData}</span>;
};

const components = {
  TableCell: EditableCell,
};

export const MetaDataTable = (props: MetadataTableProps) => {
  let tableInstance: ReactBaseTable<MetadataItem>;
  const setRef = (ref: ReactBaseTable<MetadataItem>) => {
    tableInstance = ref;
  };

  useEffect(() => {
    const dataLength = props.data.length;
    // scroll to bottom if blank row
    if (tableInstance && dataLength && props.data[dataLength - 1].key === '') {
      tableInstance.scrollToRow(dataLength - 1);
    }
  });

  const columns: ColumnShape<MetadataItem>[] = [
    {
      key: 'key',
      title: 'Key',
      dataKey: 'key',
      width: 250,
      align: Column.Alignment.LEFT,
      editMode: props.editMode,
    },
    {
      key: 'value',
      title: 'Value',
      dataKey: 'value',
      width: 250,
      align: Column.Alignment.LEFT,
      editMode: props.editMode,
    },
  ];

  return (
    <Container>
      <TitleHeader>
        <Title level={6}>{props.title}</Title>
      </TitleHeader>
      <TableWrapper>
        <AutoSizer>
          {({ width, height }) => (
            <ReactBaseTable<MetadataItem>
              ref={setRef}
              columns={columns}
              height={height}
              width={width}
              fixed
              data={props.data}
              components={components}
            />
          )}
        </AutoSizer>
      </TableWrapper>
    </Container>
  );
};
