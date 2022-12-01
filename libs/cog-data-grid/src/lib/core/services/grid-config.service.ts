import {
  NumberCellEditor,
  BoolCellRenderer,
  ListCellRenderer,
  TextCellEditor,
  CustomHeader,
  CustomCellRenderer,
} from '../../components';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import merge from 'lodash/merge';
import {
  GridConfig,
  ColumnDataType,
  ColumnConfig,
  ColumnTypes,
} from '../types';
import { decimalValueFormatter } from '../utils';
import SelectCellEditor from '../../components/select-cell-editor';

const cellClassRules = {
  'cog-table-cell-cell-empty': (params: { value: unknown }) =>
    params.value === undefined || params.value === null || params.value === '',
};
export class GridConfigService {
  private customColTypes = [] as string[];

  getDefaultColDefConfig(theme: string): ColDef {
    return {
      ...this.getColTypeProps('Link', theme),

      editable: false,

      resizable: true,

      sortable: true,
      filter: true,
      menuTabs: ['filterMenuTab'],
      cellEditor: 'textCellEditor',
      comparator(a, b) {
        // eslint-disable-next-line lodash/prefer-lodash-typecheck
        if (typeof a === 'string') {
          return a.localeCompare(b);
        } else {
          return a > b ? 1 : a < b ? -1 : 0;
        }
      },
    } as ColDef;
  }

  /**
   * Loads default ag-grid gridOptions needed for grid to work
   */
  getGridConfig(theme: string, columnTypes?: ColumnTypes): GridOptions {
    const virtualizationDisabled = this.isVirtualizationModeDisabled();

    if (columnTypes) {
      this.customColTypes = Object.keys(columnTypes);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return <GridOptions>{
      enableRangeSelection: false,
      floatingFilter: false,
      stopEditingWhenCellsLoseFocus: true,
      autoSizePadding: 0,
      singleClickEdit: false,
      multiSortKey: 'ctrl',
      domLayout: virtualizationDisabled ? 'autoHeight' : 'normal',
      suppressColumnVirtualisation: virtualizationDisabled ? true : false,
      enableCellChangeFlash: true,
      // groupUseEntireRow: true,
      // readOnlyEdit: true,
      suppressCellSelection: false,
      suppressMenuHide: false,
      enableCellExpressions: true,
      suppressAggFuncInHeader: true,
      rowHeight: 48,
      headerHeight: 44,
      // a default column definition with properties that get applied to every column
      defaultColDef: {
        ...this.getDefaultColDefConfig(theme),
      },
      components: {
        checkboxRendererComponent: BoolCellRenderer,
        numberCellEditor: NumberCellEditor,
        listCellRendererComponent: ListCellRenderer,
        decimalColType: NumberCellEditor,
        textCellEditor: TextCellEditor,
        customRendererComponent: CustomCellRenderer,
        cogCustomHeader: CustomHeader,
        selectCellEditor: SelectCellEditor,
      },
      columnTypes: merge(
        {
          booleanColType: {
            cellEditor: 'selectCellEditor',
            ...this.getColTypeProps('Boolean', theme),
            cellEditorParams: {
              options: [
                { label: 'Select value', value: null },
                { label: 'True', value: true },
                { label: 'False', value: false },
              ],
            },
            cellEditorPopup: true,
            cellStyle: { textTransform: 'capitalize' },
          },
          customColType: {
            cellRenderer: 'customRendererComponent',
            valueGetter: (params: ValueGetterParams) => {
              if (
                params.data === undefined ||
                params.colDef.field === undefined
              ) {
                return '';
              }
              const value = params.data[params.colDef.field];
              if (value === null) {
                return '';
              } else {
                return value.externalId || value._externalId;
              }
            },
            ...this.getColTypeProps('Link', theme),
          },
          textColType: {
            cellEditor: 'textCellEditor',
            ...this.getColTypeProps('String', theme),
          },
          largeTextColType: {
            cellEditor: 'textCellEditor',
            ...this.getColTypeProps('String', theme),
          },
          listColType: {
            cellRenderer: 'listCellRendererComponent',
            cellEditor: 'listCellRendererComponent',
            valueGetter: (params: ValueGetterParams) => {
              if (
                params.data === undefined ||
                params.colDef.field === undefined
              ) {
                return [];
              }
              const value = params.data[params.colDef.field];

              if (value === null) {
                return [];
              }

              // normal array
              if (Array.isArray(value)) {
                return value;
              } else if ('items' in value && Array.isArray(value.items)) {
                // complex type array
                return value.items;
              }
              return [];
            },
          },
          numberColType: {
            cellEditor: 'numberCellEditor',
            ...this.getColTypeProps('Number', theme),
          },
          decimalColType: {
            cellEditor: 'decimalColType',
            ...this.getColTypeProps('Number', theme),
            cellEditorParams: {
              allowDecimals: true,
            },
            valueFormatter: (params: ValueFormatterParams) =>
              decimalValueFormatter({
                value: params.value,
                maximumFractionDigits: 2,
                isFloat: true,
              }),
          },
        },
        columnTypes || {}
      ),
      context: {
        sum: (...args: number[]) => args.reduce((sum, x) => +sum + +x),
        round: (value: number) => Math.round(value),
        pow: (x: number, y: number) => Math.pow(x, y),
        abs: (value: number) => Math.abs(value),
        ceil: (value: number) => Math.ceil(value),
        floor: (value: number) => Math.floor(value),
        min: (...args: number[]) => Math.min(...args),
        max: (...args: number[]) => Math.max(...args),
        gridConfig: {
          multiSortKey: 'ctrl',
        },
      },
    };
  }

  buildColDefs(tableConfig: GridConfig) {
    const columns = tableConfig.columns;
    return columns
      .map((columnConfig, index) => {
        if (columnConfig.dataType === ColumnDataType.Dynamic) {
          return null;
        }

        const userProvidedColDef = columnConfig.colDef || {};
        const colDef = Object.assign(
          {
            field: columnConfig.property,
            headerName: columnConfig.label,
            type: columnConfig.columnType
              ? columnConfig.columnType
              : this.getColumnType(columnConfig),
            editable: true,
            resizable: true,
            cellClassRules: cellClassRules,
            width: userProvidedColDef.width || (index === 0 ? 240 : 200),
            cellRendererParams: {
              listDataType: this.getColumnType(columnConfig).includes(
                'listColType'
              )
                ? columnConfig.dataType
                : ColumnDataType.Text,
            },
          },
          userProvidedColDef
        ) as ColDef;
        return colDef;
      })
      .filter((col) => col);
  }

  private getColumnType({ dataType, isList }: ColumnConfig): string[] {
    //Handle here for now, untill we migrate all column types
    let dataTypeName = this.normalizeName(dataType);
    const columnTypes: string[] = [];

    if (this.customColTypes.includes(dataType)) {
      columnTypes.push(dataType);
      dataTypeName = 'custom';
    }

    switch (dataType) {
      case ColumnDataType.Boolean: {
        dataTypeName = 'boolean';
        break;
      }
      case ColumnDataType.Custom: {
        dataTypeName = 'custom';
        break;
      }
      case ColumnDataType.Number: {
        dataTypeName = 'number';
        break;
      }
      case ColumnDataType.Decimal: {
        dataTypeName = 'decimal';
        break;
      }
      case ColumnDataType.DateTime: {
        dataTypeName = 'dateTime';
        break;
      }
      default: {
        dataTypeName = 'text';
      }
    }

    const colType = `${dataTypeName}ColType`;
    columnTypes.push(colType);

    if (isList) {
      // list trumps everything
      columnTypes.push('listColType');
    }

    return columnTypes;
  }

  private isVirtualizationModeDisabled(): boolean {
    const agGridVirtualizationMode = sessionStorage.getItem(
      'agGridVirtualizationModeDisabled'
    );
    return agGridVirtualizationMode ? true : false;
  }

  /**
   * Remove chars, split by underscore, convert to camelcase string
   */
  normalizeName(name: string): string {
    return this.camelize(name.toLowerCase().split('_').join(' '));
  }

  /**
   * Convert string to camel case string
   */
  private camelize(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  private getColTypeProps(iconName: string, theme: string): ColDef {
    if (theme === 'compact') {
      return {} as ColDef;
    }

    return {
      headerComponent: 'cogCustomHeader',
      headerComponentParams: {
        headerIcon: iconName,
        enableMenu: false,
      },
    } as ColDef;
  }
}

export const gridConfigService = new GridConfigService();
