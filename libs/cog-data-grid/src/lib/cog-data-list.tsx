import { Body, Flex } from '@cognite/cogs.js';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ForwardedRef, forwardRef } from 'react';

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
    cellStyle: { display: 'flex' },
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

export const CogDataList = forwardRef<AgGridReact, CogDataListProps>(
  (props: CogDataListProps, ref: ForwardedRef<AgGridReact>) => {
    const rowData = props.listData.map((value) => ({
      value: value?.toString(),
    }));

    return (
      <AgGridReact<Row>
        ref={ref}
        columnDefs={columnDefs}
        headerHeight={0}
        rowData={rowData}
        rowHeight={44}
        gridOptions={{ enableCellTextSelection: true }}
        rowStyle={{
          borderBottom: '1px solid var(--cogs-border--muted)',
        }}
      />
    );
  }
);
