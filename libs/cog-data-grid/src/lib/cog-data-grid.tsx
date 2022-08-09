import { Icon } from '@cognite/cogs.js';
import { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { ForwardedRef, forwardRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CogDataGridStyled } from './cog-data-grid-styled';
import './cog-data-grid.module.css';
import { gridConfigService } from './core/services/grid-config.service';
import { ColumnTypes, GridConfig, KeyValueMap } from './core/types';

export interface CogDataGridProps extends AgGridReactProps {
  theme?: 'default' | 'compact';
  data?: KeyValueMap[];
  config: GridConfig;
  /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property. */
  columnTypes?: ColumnTypes;
  gridOptions?: GridOptions;
  rowNodeId?: string;
  children?: any;
}

export const CogDataGrid = forwardRef<AgGridReact, CogDataGridProps>(
  (props: CogDataGridProps, ref: ForwardedRef<AgGridReact>) => {
    const [isGridInit, setIsGridInit] = useState(false);
    const [colDefs, setColDefs] = useState<(ColDef | ColGroupDef)[]>([]);
    const [gridOptions, setGridOptions] = useState<GridOptions>({});

    const theme = props.theme || 'default';

    useEffect(() => {
      const agGridOptions = Object.assign(
        gridConfigService.getGridConfig(
          theme,
          props.columnTypes,
          props.rowNodeId
        ),
        props.gridOptions || {}
      ) as GridOptions;

      if (props.rowNodeId && !props.getRowId) {
        agGridOptions.getRowNodeId = (data) =>
          props.rowNodeId ? data[props.rowNodeId] : data.id;
      }

      Object.keys(props).forEach((key: string) => {
        if (!['config', 'data', 'columnTypes', 'theme'].includes(key)) {
          (agGridOptions as any)[key] = (props as any)[key];
        }
      });

      const generatedColDefs = gridConfigService.buildColDefs(props.config);
      setGridOptions(agGridOptions);
      setColDefs(generatedColDefs as any);
      setIsGridInit(true);

      // re-generate colDefs every time config is changed
      // eslint-disable-next-line
    }, [props.config]);

    if (!isGridInit) {
      return <div>Loading...</div>;
    }

    const gridProps = props.rowData || { rowData: props.data || [] };

    return (
      <CogDataGridStyled theme={theme}>
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
          {...gridOptions}
          {...gridProps}
          // rowData={props.data}
        >
          {props.children}
        </AgGridReact>
      </CogDataGridStyled>
    );
  }
);

export default CogDataGrid;
