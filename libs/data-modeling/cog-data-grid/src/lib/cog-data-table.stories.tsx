import { PropsWithChildren, useState } from 'react';
import { CogDataTable } from './cog-data-table';
import { ColDef } from 'ag-grid-community';
import { ThemeNames } from './types';
import { gridConfigService } from './core/services/grid-config.service';
import { ColumnDataType } from './core/types';

export default {
  title: 'Basic components/CogDataTable',
  component: CogDataTable,
};

const Wrapper = (props: PropsWithChildren) => {
  return (
    <div
      style={{
        height: '600px',
        width: '600px',
        display: 'block',
        overflow: 'hidden',
      }}
    >
      {props.children}
    </div>
  );
};

interface BaseProps {
  theme?: ThemeNames;
}
export const Base = (props: BaseProps) => {
  const [colDefs] = useState<ColDef[]>([
    {
      field: 'make',
      headerName: 'Manufacturer',
      sortable: true,
      type: gridConfigService.getColumnType(ColumnDataType.Text),
    },
    {
      field: 'model',
      headerName: 'Model',
      type: gridConfigService.getColumnType(ColumnDataType.Text),
    },
    {
      field: 'price',
      headerName: 'Price',
      type: gridConfigService.getColumnType(ColumnDataType.Text),
    },
  ]);

  const [rowData] = useState([
    { id: 1, make: 'Toyota', model: 'Celica', price: 35000 },
    { id: 2, make: 'Ford', model: 'Mondeo', price: 32000 },
    { id: 3, make: 'Porsche', model: 'Boxster', price: 72000 },
  ]);

  return (
    <Wrapper>
      <CogDataTable
        columnDefs={colDefs}
        rowData={rowData}
        rowHeight={44}
        headerHeight={44}
        defaultColDef={gridConfigService.getDefaultColDefConfig(
          props.theme || 'default'
        )}
        getRowId={(params) => params.data.id}
        theme={props.theme || 'default'}
      />
    </Wrapper>
  );
};

export const DefaultTheme = () => {
  return <Base theme={'default'} />;
};

export const BasicTheme = () => {
  return <Base theme={'basic-striped'} />;
};

export const SuggestionsTheme = () => {
  return <Base theme={'suggestions'} />;
};

/** For some reason, we have different designs for each table, so I needed to create new theme
 * This one is used in the table for Data Model UI
 */
export const CompactTheme = () => {
  return <Base theme={'compact'} />;
};
