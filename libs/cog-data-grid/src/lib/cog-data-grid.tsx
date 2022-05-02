import './cog-data-grid.module.css';
import { ColumnTypes, GridConfig, KeyValueMap, TableType } from './core/types';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState, forwardRef, ForwardedRef } from 'react';
import {
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';
import { gridConfigService } from './core/services/grid-config.service';
import { Icon } from '@cognite/cogs.js';

import { CogDataGridStyled } from './cog-data-grid-styled';
import ReactDOM from 'react-dom';

export interface CogDataGridProps {
  data?: KeyValueMap[];
  config: GridConfig;
  tableType?: TableType;
  /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property. */
  columnTypes?: ColumnTypes;
  gridOptions?: GridOptions;
  rowNodeId?: string;
  children?: any;
  onCellValueChanged?: (e: CellValueChangedEvent) => void;
  onGridReady?: (e: GridReadyEvent) => void;
}

export const CogDataGrid = forwardRef<AgGridReact, CogDataGridProps>(
  (props: CogDataGridProps, ref: ForwardedRef<AgGridReact>) => {
    const [isGridInit, setIsGridInit] = useState(false);
    const [colDefs, setColDefs] = useState<(ColDef | ColGroupDef)[]>([]);
    const [gridOptions, setGridOptions] = useState<GridOptions>({});
    const tableType = props.tableType || 'default';

    useEffect(() => {
      if (!isGridInit) {
        const agGridOptions = Object.assign(
          gridConfigService.getGridConfig(
            tableType,
            props.columnTypes,
            props.rowNodeId
          ),
          props.gridOptions || {}
        );

        if (props.onCellValueChanged) {
          agGridOptions.onCellValueChanged = props.onCellValueChanged;
        }
        if (props.onGridReady) {
          agGridOptions.onGridReady = props.onGridReady;
        }

        const generatedColDefs = gridConfigService.buildColDefs(props.config);
        setGridOptions(agGridOptions);
        setColDefs(generatedColDefs as any);
        setIsGridInit(true);
      }
    }, [isGridInit, props.config]);

    if (!isGridInit) {
      return <div>Loading...</div>;
    }

    const gridProps = props.data ? { rowData: props.data } : {};

    return (
      <CogDataGridStyled tableType={tableType}>
        <AgGridReact
          // components={components}
          ref={ref}
          columnDefs={colDefs}
          gridOptions={gridOptions}
          icons={{
            sortAscending: () => {
              const domNode = document.createElement('div');
              ReactDOM.render(<Icon type="ReorderAscending" />, domNode);
              return domNode;
            },
            sortDescending: () => {
              const domNode = document.createElement('div');
              ReactDOM.render(<Icon type="ReorderDescending" />, domNode);
              return domNode;
            },
          }}
          {...gridProps}
          // rowData={props.data}
          className="ag-theme-alpine"
        >
          {props.children}
        </AgGridReact>
      </CogDataGridStyled>
    );
  }
);

export default CogDataGrid;
