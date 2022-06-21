import { fileMetaDataEdit } from 'src/modules/FileDetails/slice';
import styled from 'styled-components';
import { Input, Title } from '@cognite/cogs.js';
import React, { ChangeEvent, ReactText, useEffect } from 'react';
import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';
import store from 'src/store';
import {
  MetadataItem,
  VisionFileDetails,
} from 'src/modules/FileDetails/Components/FileMetadata/Types';
import exifIcon from 'src/assets/exifIcon.svg';
import { TableDataItem } from 'src/modules/Common/types';
import { ExifIcon } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { keyGenerator } from 'src/utils/keyGenerator/keyGenerator';

type TableProps = Omit<Omit<BaseTableProps<TableDataItem>, 'width'>, 'height'>;

type MetadataTableProps = TableProps & {
  title: string;
  editMode: boolean;
  data: MetadataItem[];
  columnWidth: number;
  details: VisionFileDetails | null;
  toolBar: JSX.Element;
};

// this type only contain the needed properties
type CellProps = {
  column: ColumnShape<MetadataItem>;
  cellData: ReactText;
  columnIndex: number;
  rowIndex: number;
  rowData: { metaKey: string; metaValue: string };
};

const { dispatch } = store;
const updateCell = (inputValue: string, cellProps: CellProps) => {
  if (cellProps.columnIndex === 0) {
    // editing key
    dispatch(
      fileMetaDataEdit({
        rowIndex: cellProps.rowIndex,
        metaKey: inputValue,
        metaValue: cellProps.rowData.metaValue,
      })
    );
  } else if (cellProps.columnIndex === 1) {
    // editing value
    dispatch(
      fileMetaDataEdit({
        rowIndex: cellProps.rowIndex,
        metaKey: cellProps.rowData.metaKey,
        metaValue: inputValue,
      })
    );
  }
};

const EditableCell = (cellProps: CellProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateCell(e.target.value, cellProps);
  };
  if (cellProps.column.editMode) {
    return (
      <Input
        type="text"
        value={cellProps.cellData}
        fullWidth
        onChange={handleChange}
      />
    );
  }
  return (
    <span style={{ overflow: 'auto', maxHeight: '50px' }}>
      {cellProps.cellData}
    </span>
  );
};

const components = {
  TableCell: EditableCell,
};

export const MetaDataTable = (props: MetadataTableProps) => {
  const metaUniqueKeyGenerator = keyGenerator({ prefix: 'meta-key' });
  const data = props.data.map((dataItem) => ({
    ...dataItem,
    key: metaUniqueKeyGenerator.next().value,
  }));

  let tableInstance: ReactBaseTable<MetadataItem>;
  const setRef = (ref: ReactBaseTable<MetadataItem>) => {
    tableInstance = ref;
  };

  useEffect(() => {
    const dataLength = props.data.length;
    // scroll to bottom if blank row
    if (
      tableInstance &&
      dataLength &&
      props.data[dataLength - 1].metaKey === ''
    ) {
      tableInstance.scrollToRow(dataLength - 1);
    }
  }, [props.data]);

  const columns: ColumnShape<MetadataItem>[] = [
    {
      key: 'metaKey',
      title: 'Key',
      dataKey: 'metaKey',
      width: props.columnWidth,
      align: Column.Alignment.LEFT,
      editMode: props.editMode,
    },
    {
      key: 'metaValue',
      title: 'Value',
      dataKey: 'metaValue',
      width: props.columnWidth,
      align: Column.Alignment.LEFT,
      editMode: props.editMode,
    },
  ];

  return (
    <Container>
      <TitleHeader width={props.columnWidth * 2}>
        <Left>
          <Title level={6}>{props.title}</Title>
          {props.details?.geoLocation && (
            <ExifIcon>
              <img src={exifIcon} alt="exifIcon" />
            </ExifIcon>
          )}
        </Left>
        <Right>{props.toolBar}</Right>
      </TitleHeader>
      <TableWrapper>
        <ReactBaseTable<MetadataItem>
          key="ReactBaseTable"
          ref={setRef}
          columns={columns}
          maxHeight={Infinity}
          width={props.columnWidth * columns.length}
          data={data}
          rowKey="key"
          components={components}
        />
      </TableWrapper>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  padding-bottom: 10px;
`;

const TitleHeader = styled.div<{ width: number }>`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
  margin-bottom: 14px;
  width: ${(props) => `${props.width}px`};
`;

const Left = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-self: center;
  grid-gap: 10px;
`;

const Right = styled.div`
  justify-self: end;
  align-self: center;
  grid-gap: 10px;
`;
