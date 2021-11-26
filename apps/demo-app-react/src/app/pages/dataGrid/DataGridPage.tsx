import { CogDataGrid } from '@cognite/cog-data-grid';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { configSample } from './config-mock';
import { responseSample } from './response-mock';

export const DataGridPage = () => {
  const rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
  ];

  return (
    <div>
      <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
        {/* <AgGridReact rowData={rowData}>
          <AgGridColumn field="make"></AgGridColumn>
          <AgGridColumn field="model"></AgGridColumn>
          <AgGridColumn field="price"></AgGridColumn>
        </AgGridReact> */}
        <CogDataGrid data={responseSample} config={configSample} />
      </div>
    </div>
  );
};
