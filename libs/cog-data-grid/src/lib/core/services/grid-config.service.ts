import {
  NumberCellEditor,
  BoolCellRenderer,
  ListCellRenderer,
  TextCellEditor,
  CustomHeader,
  CustomCellRenderer,
} from '../../components';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
  GridConfig,
  ColumnDataType,
  ColumnConfig,
  ColumnTypes,
} from '../types';

const cellClassRules = {
  'cog-table-cell-cell-empty': (params: any) =>
    params.value === undefined || params.value === null || params.value === '',
};
export class GridConfigService {
  private customColTypes = [] as string[];

  /**
   * Loads default ag-grid gridOptions needed for grid to work
   */
  getGridConfig(
    theme: string,
    columnTypes?: ColumnTypes,
    rowNodeId?: string
  ): GridOptions {
    const virtualizationDisabled = this.isVirtualizationModeDisabled();

    if (columnTypes) {
      this.customColTypes = Object.keys(columnTypes);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return <GridOptions>{
      enableRangeSelection: false,
      floatingFilter: false,
      stopEditingWhenCellsLoseFocus: false,
      autoSizePadding: 0,
      singleClickEdit: false,
      editType: 'fullRow',
      multiSortKey: 'ctrl',
      domLayout: virtualizationDisabled ? 'autoHeight' : 'normal',
      suppressColumnVirtualisation: virtualizationDisabled ? true : false,
      enableCellChangeFlash: true,
      // groupUseEntireRow: true,
      suppressCellSelection: false,
      suppressMenuHide: false,
      enableCellExpressions: true,
      suppressAggFuncInHeader: true,
      rowHeight: 48,
      headerHeight: 44,
      // a default column definition with properties that get applied to every column
      defaultColDef: {
        ...this.getColTypeProps('String', theme),
        // make every column editable
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
      },
      components: {
        checkboxRendererComponent: BoolCellRenderer,
        numberCellEditor: NumberCellEditor,
        listCellRendererComponent: ListCellRenderer,
        decimalColType: NumberCellEditor,
        textCellEditor: TextCellEditor,
        customRendererComponent: CustomCellRenderer,
        cogCustomHeader: CustomHeader,
      },
      columnTypes: Object.assign(
        {
          booleanColType: {
            cellRenderer: 'checkboxRendererComponent',
            ...this.getColTypeProps('Boolean', theme),
          },
          customColTypes: {
            cellRenderer: 'customRendererComponent',
            ...this.getColTypeProps('Link', theme),
          },
          largeTextColType: {
            cellEditor: 'textCellEditor',
            ...this.getColTypeProps('String', theme),
          },
          listColType: {
            cellRenderer: 'listCellRendererComponent',
            ...this.getColTypeProps('List', theme),
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
              params.value && params.value !== 0
                ? params.value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })
                : '',
          },
        },
        columnTypes || {}
      ),
      context: {
        sum: (...args: any[]) => args.reduce((sum, x) => +sum + +x),
        round: (value: number) => Math.round(value),
        pow: (x: any, y: any) => Math.pow(x, y),
        abs: (value: any) => Math.abs(value),
        ceil: (value: any) => Math.ceil(value),
        floor: (value: any) => Math.floor(value),
        min: (...args: any) => Math.min(...args),
        max: (...args: any) => Math.max(...args),
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

        const isEditable =
          this.isNotEditableIfExpressionOrEditRule(columnConfig);

        const userProvidedColDef = columnConfig.colDef || {};
        const colDef = Object.assign(
          {
            field: `${columnConfig.property}`,
            headerName: `${columnConfig.label}`,
            type: columnConfig.columnType
              ? columnConfig.columnType
              : this.getColumnType(columnConfig),
            editable: isEditable,
            resizable: true,
            cellClassRules: cellClassRules,
            width: userProvidedColDef.width || (index === 0 ? 240 : 200),
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

    if (isList) {
      dataTypeName = 'list';
      return ['listColType', dataType];
    }

    if (this.customColTypes.includes(dataType)) {
      return [dataType];
    }

    if (dataType === ColumnDataType.Text) {
      return [];
    }

    if (dataType === ColumnDataType.Boolean) {
      dataTypeName = 'boolean';
      return ['booleanColType'];
    }

    if (dataType === ColumnDataType.Custom) {
      dataTypeName = 'custom';
      return ['customColTypes'];
    }

    if (dataType === ColumnDataType.Number) {
      dataTypeName = 'number';
      return [`${dataTypeName}ColType`];
    }

    if (dataType === ColumnDataType.Decimal) {
      dataTypeName = 'decimal';
      return [`${dataTypeName}ColType`];
    }

    if (dataType === ColumnDataType.DateTime) {
      dataTypeName = 'date';
    }

    let colType = `${dataTypeName}ColType`;

    if (colType === 'dateColType') {
      colType = 'dateTimeColType';
    }

    return [];
  }

  private isNotEditableIfExpressionOrEditRule(column: ColumnConfig): boolean {
    let isEditable = true;

    const isExpression = (column.defaultValue as string)
      .toString()
      .startsWith('=');

    if (isExpression || column.dataType === ColumnDataType.Boolean) {
      isEditable = false;
    }

    return isEditable;
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
