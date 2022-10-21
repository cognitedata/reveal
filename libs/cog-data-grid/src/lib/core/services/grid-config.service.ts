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
import { decimalValueFormatter } from '../utils';
import { ReactNode } from 'react';
import SelectCellEditor from '../../components/select-cell-editor';

const cellClassRules = {
  'cog-table-cell-cell-empty': (params: any) =>
    params.value === undefined || params.value === null || params.value === '',
};
export class GridConfigService {
  private customColTypes = [] as string[];

  getDefaultColDefConfig(theme: string): ColDef {
    return {
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
    } as ColDef;
  }

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
      stopEditingWhenCellsLoseFocus: true,
      autoSizePadding: 0,
      singleClickEdit: false,
      editType: '', // removed 'fullRow' for now, since there seems to be a bug in ag grid in full row edit
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
      columnTypes: Object.assign(
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
            cellStyle: { 'text-transform': 'capitalize' },
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
            cellEditor: 'listCellRendererComponent',
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

    if (isList) {
      dataTypeName = 'list';
      return ['listColType'];
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
