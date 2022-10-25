import { Body, Flex } from '@cognite/cogs.js';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const CellRenderer = (params: ICellRendererParams<Row, string>) => (
  <Flex alignItems="center" style={{ height: '100%' }}>
    <Body
      level={2}
      style={{
        color: 'var(--cogs-text-icon--strong)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {params.value}
    </Body>
  </Flex>
);

const columnDefs: ColDef<Row>[] = [
  {
    field: 'value',
    flex: 1,
    cellRenderer: CellRenderer,
  },
];

export type PrimitiveTypes = string | number | boolean | null | undefined;

export type PrimitiveTypesListData = PrimitiveTypes[];

type Row = {
  value: PrimitiveTypes;
};

type CogDataListProps = {
  listData: PrimitiveTypesListData;
};

export const CogDataList = (props: CogDataListProps) => {
  const rowData = props.listData.map((value) => ({ value: value?.toString() }));

  return (
    <AgGridReact<Row>
      columnDefs={columnDefs}
      headerHeight={0}
      rowData={rowData}
      rowHeight={44}
      rowStyle={{
        borderBottom: '1px solid var(--cogs-border--muted)',
      }}
    />
  );
};
