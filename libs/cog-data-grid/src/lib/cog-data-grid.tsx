import { Icon } from '@cognite/cogs.js';
import {
  ColDef,
  ColGroupDef,
  GetRowIdParams,
  GridOptions,
} from 'ag-grid-community';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { CogDataGridStyled } from './cog-data-grid-styled';
import './cog-data-grid.module.css';
import { gridConfigService } from './core/services/grid-config.service';
import { ColumnTypes, GridConfig, KeyValueMap } from './core/types';
import { ThemeNames } from './types';

export interface CogDataGridProps extends AgGridReactProps {
  theme?: ThemeNames;
  data?: KeyValueMap[];
  config: GridConfig;
  /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property. */
  columnTypes?: ColumnTypes;
  gridOptions?: GridOptions;
  rowNodeId?: string;
  children?: any;
  agGridReactProps?: AgGridReactProps;
  getRowId?: (params: GetRowIdParams<KeyValueMap>) => string;
  shouldShowDraftRows?: boolean;
  shouldShowPublishedRows?: boolean;
  wrapperStyle?: CSSProperties;
}

export const CogDataGrid = forwardRef<AgGridReact, CogDataGridProps>(
  (props: CogDataGridProps, ref: ForwardedRef<AgGridReact>) => {
    const [isGridInit, setIsGridInit] = useState(false);
    const [colDefs, setColDefs] = useState<(ColDef | ColGroupDef)[]>([]);

    const theme = props.theme || 'default';
    const defaultGridOptions = gridConfigService.getGridConfig(
      theme,
      props.columnTypes
    ) as GridOptions;

    useEffect(() => {
      const generatedColDefs = gridConfigService.buildColDefs(props.config);
      setColDefs(generatedColDefs as any);
      setIsGridInit(true);

      // re-generate colDefs every time config is changed
      // eslint-disable-next-line
    }, [props.config]);

    if (!isGridInit) {
      return <div>Loading...</div>;
    }

    const gridData = props.rowData || { rowData: props.data || [] };

    // we have some logic arround this props, so don't add them automatically
    const ignoredProps = [
      'config',
      'data',
      'columnTypes',
      'theme',
      'gridOptions',
    ];

    const filteredProps = {} as GridOptions;
    Object.keys(props).forEach((key: string) => {
      if (!ignoredProps.includes(key)) {
        (filteredProps as any)[key] = (props as any)[key];
      }
    });

    if (filteredProps.defaultColDef) {
      filteredProps.defaultColDef = {
        ...gridConfigService.getDefaultColDefConfig(theme),
        ...filteredProps.defaultColDef,
      };
    }

    if (props.rowNodeId && !props.getRowId) {
      defaultGridOptions.getRowNodeId = (data: KeyValueMap) =>
        props.rowNodeId ? data[props.rowNodeId] : (data as any).id;
    }

    const updatedProps = Object.assign(defaultGridOptions, props.gridOptions);

    return (
      <CogDataGridStyled
        theme={theme}
        style={props.wrapperStyle}
        shouldShowDraftRows={props.shouldShowDraftRows}
        shouldShowPublishedRows={props.shouldShowPublishedRows}
      >
        <AgGridReact
          ref={ref}
          columnDefs={colDefs}
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
          {...updatedProps}
          {...filteredProps}
          {...gridData}
        >
          {props.children}
        </AgGridReact>
      </CogDataGridStyled>
    );
  }
);

export default CogDataGrid;
