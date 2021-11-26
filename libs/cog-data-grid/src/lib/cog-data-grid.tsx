import './cog-data-grid.module.css';
import { GridConfig, KeyValueMap } from './core/types';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from 'react';
import { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { GridConfigService } from './core/services/grid-config.service';

const gridConfigService = new GridConfigService();

export interface CogDataGridProps {
  data: KeyValueMap[];
  config: GridConfig;
  children?: any;
}

export function CogDataGrid(props: CogDataGridProps) {
  const [isGridInit, setIsGridInit] = useState(false);
  const [colDefs, setColDefs] = useState<(ColDef | ColGroupDef)[]>([]);
  const [gridOptions, setGridOptions] = useState<GridOptions>({});
  console.log(props);

  const onCellValueChanged = (e: any) => {
    console.log(e);
  };

  useEffect(() => {
    if (!isGridInit) {
      const tmpGridOptions = Object.assign(gridConfigService.getGridConfig(), {
        stopEditingWhenGridLosesFocus: false,
        onCellValueChanged: onCellValueChanged,
      });

      const generatedColDefs = gridConfigService.buildColDefs(props.config);

      console.log(generatedColDefs);
      setGridOptions(tmpGridOptions);
      setColDefs(generatedColDefs as any);

      setIsGridInit(true);
    }
  }, [isGridInit]);

  if (!isGridInit) {
    return <div>Loading...</div>;
  }
  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
      <AgGridReact
        rowData={props.data}
        columnDefs={colDefs}
        gridOptions={gridOptions}
      >
        {props.children}
      </AgGridReact>
    </div>
  );
}

export default CogDataGrid;
