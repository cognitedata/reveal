import { Button } from '@cognite/cogs.js';

import { useTableRows } from '../hooks/sdk-queries';
import { SelectedColumns } from '../types';

export interface SelectedTableProps {
  selectedTable: string;
  selectedDatabase: string;
  setFromColumn: (tableId: string, fromColumnNew: string) => void;
  setToColumn: (tableId: string, toColumnNew: string) => void;
  getColumnsForTable: (tableId: string | null) => SelectedColumns;
}

interface Column {
  lastUpdatedTime: Date;
  columns: Record<string, any>;
  key: string;
}

export const SelectedTable = ({
  selectedTable,
  selectedDatabase,
  setFromColumn,
  setToColumn,
  getColumnsForTable,
}: SelectedTableProps) => {
  const columnSet = new Set<string>();
  const { fromColumn, toColumn } = getColumnsForTable(selectedTable) || {};

  const { data, isLoading, isError, error } = useTableRows(
    {
      database: selectedDatabase,
      table: selectedTable,
      pageSize: 100,
    },
    { enabled: true }
  );

  if (isLoading) {
    // Handle loading state
    return <div>Loading...</div>;
  }

  if (isError) {
    // Handle error state
    console.log(error);
    return <div>Error</div>;
  }

  data!.pages.forEach((page) => {
    page.items.forEach(({ columns }: Column) => {
      Object.keys(columns).forEach((columnKey) => {
        columnSet.add(columnKey);

        if (columnKey === 'fromExternalId' || columnKey === 'fromColumn') {
          setFromColumn(selectedTable, columnKey);
        }
        if (columnKey === 'toExternalId' || columnKey === 'toColumn') {
          setToColumn(selectedTable, columnKey);
        }
      });
    });
  });

  return (
    <div>
      {selectedDatabase && (
        <>
          <div>
            <p>
              Select <i>fromColumn</i>:
            </p>
            {Array.from(columnSet).map((columnKey) => (
              <Button
                key={columnKey}
                onClick={() => setFromColumn(selectedTable, columnKey)}
                style={{
                  margin: '5px',
                  backgroundColor:
                    fromColumn === columnKey ? 'lightblue' : 'lightgray',
                }}
              >
                {columnKey}
              </Button>
            ))}
          </div>
          <div>
            <p>
              Select <i>toColumn</i>:
            </p>
            {Array.from(columnSet).map((columnKey) => (
              <Button
                key={columnKey}
                onClick={() => setToColumn(selectedTable, columnKey)}
                style={{
                  margin: '5px',
                  backgroundColor:
                    toColumn === columnKey ? 'lightblue' : 'lightgray',
                }}
              >
                {columnKey}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
