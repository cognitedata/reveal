import {
  ColDef,
  GridOptions,
  IFilterDef,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import merge from 'lodash/merge';
import {
  BoolCellRenderer,
  CustomCellRenderer,
  CustomHeader,
  ListCellRenderer,
  NumberCellEditor,
  TextCellEditor,
  SelectCellEditor,
} from '../../components';
import { JsonCellRenderer } from '../../components/json-cell-renderer';
import { ColumnDataType, ColumnTypes, GridConfig } from '../types';
import { decimalValueFormatter } from '../utils';

const cellClassRules = {
  'cog-table-cell-cell-empty': (params: { value: unknown }) =>
    params.value === undefined || params.value === null || params.value === '',
};
export class GridConfigService {
  private customColTypes = [] as string[];

  getDefaultColDefConfig(theme: string): ColDef {
    return {
      ...this.getColTypeProps(ColumnDataType.Text, 'Link', theme),

      editable: false,

      resizable: true,

      sortable: true,
      filter: true,
      suppressMenu: false,
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
        cogCustomHeader: CustomHeader,
        customRendererComponent: CustomCellRenderer,
        decimalColType: NumberCellEditor,
        jsonCellRenderer: JsonCellRenderer,
        listCellRendererComponent: ListCellRenderer,
        numberCellEditor: NumberCellEditor,
        selectCellEditor: SelectCellEditor,
        textCellEditor: TextCellEditor,
      },
      columnTypes: merge(
        {
          booleanColType: {
            cellEditor: 'selectCellEditor',
            ...this.getColTypeProps(ColumnDataType.Boolean, 'Boolean', theme),
            cellEditorParams: {
              options: [
                { label: 'Select value', value: null },
                { label: 'true', value: true },
                { label: 'false', value: false },
              ],
            },
            cellEditorPopup: true,
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
            ...this.getColTypeProps(ColumnDataType.Custom, 'Link', theme),
          },
          idColType: {
            ...this.getColTypeProps(ColumnDataType.Id, 'String', theme),
          },
          jsonColType: {
            cellRenderer: 'jsonCellRenderer',
            ...this.getColTypeProps(ColumnDataType.Json, 'Code', theme),
          },
          textColType: {
            cellEditor: 'textCellEditor',
            ...this.getColTypeProps(ColumnDataType.Text, 'String', theme),
          },
          largeTextColType: {
            cellEditor: 'textCellEditor',
            ...this.getColTypeProps(ColumnDataType.Text, 'String', theme),
          },
          listColType: {
            cellRenderer: 'listCellRendererComponent',
            cellEditor: 'listCellRendererComponent',
            filterParams: {
              defaultOption: 'containsAny',
              filterOptions: [
                {
                  displayKey: 'containsAny',
                  displayName: 'Contains Any',
                  predicate: () => true,
                },
                {
                  displayKey: 'containsAll',
                  displayName: 'Contains All',
                  predicate: () => true,
                },
              ],
            },
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
            ...this.getColTypeProps(ColumnDataType.Number, 'Number', theme),
          },
          decimalColType: {
            cellEditor: 'decimalColType',
            ...this.getColTypeProps(ColumnDataType.Decimal, 'Number', theme),
            cellEditorParams: {
              allowDecimals: true,
            },
            valueFormatter: (params: ValueFormatterParams) =>
              decimalValueFormatter({
                value: params.value,
                isFloat: true,
              }),
          },
          dateTimeColType: {
            cellEditor: 'textCellEditor',
            ...this.getColTypeProps(ColumnDataType.DateTime, 'Calendar', theme),
          },
          // default no auto header or cell editor
          defaultColType: {},
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
              : this.getColumnType(columnConfig.dataType, columnConfig.isList),
            editable: true,
            resizable: true,
            cellClassRules: cellClassRules,
            width: userProvidedColDef.width || (index === 0 ? 240 : 200),
            cellRendererParams: {
              listDataType: this.getColumnType(
                columnConfig.dataType,
                columnConfig.isList
              ).includes('listColType')
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

  getColumnType(dataType: ColumnDataType | string, isList = false): string[] {
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
      case ColumnDataType.Text: {
        dataTypeName = 'text';
        break;
      }
      case ColumnDataType.Id: {
        dataTypeName = 'id';
        break;
      }
      case ColumnDataType.Json: {
        dataTypeName = 'json';
        break;
      }
      default: {
        dataTypeName = 'default';
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

  getFilterParams(dataType: ColumnDataType | string) {
    let filterName: IFilterDef['filter'] = 'agTextColumnFilter';
    const filterParams: ColDef['filterParams'] = {
      buttons: ['reset'],
      debounceMs: 500,
      filterOptions: [
        'equals',
        'startsWith',
        {
          displayKey: 'blank',
          displayName: 'Is empty',
          predicate: () => true,
          numberOfInputs: 0,
        },
        {
          displayKey: 'notBlank',
          displayName: 'Is not empty',
          predicate: () => true,
          numberOfInputs: 0,
        },
      ],
      defaultOption: 'equals',
      suppressAndOrCondition: true,
    };

    switch (dataType) {
      case ColumnDataType.Id: {
        filterName = 'agTextColumnFilter';

        filterParams.filterOptions = [
          'equals',
          {
            displayKey: 'blank',
            displayName: 'Is empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          {
            displayKey: 'notBlank',
            displayName: 'Is not empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
        ];
        break;
      }
      case ColumnDataType.Boolean: {
        filterName = 'boolean';
        filterParams.filterOptions = [
          'equals',
          {
            displayKey: 'blank',
            displayName: 'Is empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          {
            displayKey: 'notBlank',
            displayName: 'Is not empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
        ];
        break;
      }
      case ColumnDataType.Number: {
        filterName = 'agNumberColumnFilter';
        filterParams.filterOptions = [
          'equals',
          'inRange',
          {
            displayKey: 'blank',
            displayName: 'Is empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          {
            displayKey: 'notBlank',
            displayName: 'Is not empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          'lessThan',
          'lessThanOrEqual',
          'greaterThan',
          'greaterThanOrEqual',
        ];
        break;
      }
      case ColumnDataType.Decimal: {
        filterName = 'agNumberColumnFilter';
        filterParams.filterOptions = [
          'equals',
          'inRange',
          {
            displayKey: 'blank',
            displayName: 'Is empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          {
            displayKey: 'notBlank',
            displayName: 'Is not empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          'lessThan',
          'lessThanOrEqual',
          'greaterThan',
          'greaterThanOrEqual',
        ];
        break;
      }
      case ColumnDataType.DateTime: {
        filterName = 'agDateColumnFilter';
        filterParams.filterOptions = [
          'equals',
          'inRange',
          {
            displayKey: 'blank',
            displayName: 'Is empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          {
            displayKey: 'notBlank',
            displayName: 'Is not empty',
            predicate: () => true,
            numberOfInputs: 0,
          },
          'lessThan',
          'lessThanOrEqual',
          'greaterThan',
          'greaterThanOrEqual',
        ];
        break;
      }
      case ColumnDataType.Custom: {
        filterName = 'customColumnFilter';
        break;
      }
      default: {
        filterName = 'agTextColumnFilter';
      }
    }

    return { filterName, filterParams };
  }

  private getColTypeProps(
    dataType: ColumnDataType | string,
    iconName: string,
    theme: string
  ): ColDef {
    if (theme === 'compact' || theme === 'basic-striped') {
      return {} as ColDef;
    }

    const { filterName, filterParams } = this.getFilterParams(dataType);

    return {
      headerComponent: 'cogCustomHeader',
      headerComponentParams: {
        headerIcon: iconName,
      },
      filter: filterName,
      filterParams,
    } as ColDef;
  }
}

export const gridConfigService = new GridConfigService();
