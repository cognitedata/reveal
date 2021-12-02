import { ColDef, GridOptions } from 'ag-grid-community';
import {
  GridConfig,
  ColumnDataType,
  ColumnValueType,
  ColumnConfig,
} from '../types';

const cellClassRules = {
  'platypus-cell-empty': (params: any) => !params.value,
};
export class GridConfigService {
  /**
   * Loads default ag-grid gridOptions needed for grid to work
   */
  getGridConfig(): GridOptions {
    const virtualizationDisabled = this.isVirtualizationModeDisabled();
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return <GridOptions>{
      enableRangeSelection: true,
      immutableData: true,
      floatingFilter: false,
      stopEditingWhenGridLosesFocus: true,
      autoSizePadding: 0,
      singleClickEdit: false,
      multiSortKey: 'ctrl',
      domLayout: virtualizationDisabled ? 'autoHeight' : 'normal',
      suppressColumnVirtualisation: virtualizationDisabled ? true : false,
      enableCellChangeFlash: true,
      // groupUseEntireRow: true,
      suppressCellSelection: false,
      suppressMenuHide: true,
      enableCellExpressions: true,
      suppressAggFuncInHeader: true,
      getRowNodeId: (data) => data.id,
      // a default column definition with properties that get applied to every column
      defaultColDef: {
        // make every column editable
        editable: false,

        resizable: true,

        sortable: true,
        filter: true,
        menuTabs: ['filterMenuTab'],
        comparator(a, b) {
          // eslint-disable-next-line lodash/prefer-lodash-typecheck
          if (typeof a === 'string') {
            return a.localeCompare(b);
          } else {
            return a > b ? 1 : a < b ? -1 : 0;
          }
        },
      },
      columnTypes: {
        booleanColType: {
          cellStyle: { 'text-align': 'center' },
          cellRenderer: 'checkboxRendererComponent',
        },
      },
      context: {
        sum: (...args: any[]) => args.reduce((sum, x) => +sum + +x),
        round: (value: number) => Math.round(value),
        pow: (x: any, y: any) => Math.pow(x, y),
        abs: (value: any) => Math.abs(value),
        ceil: (value: any) => Math.ceil(value),
        floor: (value: any) => Math.floor(value),
        min: (...args: any) => Math.min(...args),
        max: (...args: any) => Math.max(...args),
      },
    };
  }

  buildColDefs(tableConfig: GridConfig) {
    const columns = tableConfig.columns;
    return columns
      .map((columnConfig) => {
        if (columnConfig.data_type === ColumnDataType.Dynamic) {
          return null;
        }
        // hide: this.isNotVisibleIfVisibilityRule(attr, context),
        //   cellEditor: 'inputCellEditorComponent',
        //   cellClassRules: {
        //     'cell-editable': `return ${isEditable === true}`,
        //   },
        //   cellEditorParams: {
        //     config: cellEditorParams,
        //   },
        //   optional: attr.optional || true,
        const isEditable =
          this.isNotEditableIfExpressionOrEditRule(columnConfig);
        const colDef = {
          field: `attributes.${columnConfig.property}`,
          headerName: `${columnConfig.label}`,
          type: this.getColumnType(columnConfig.data_type),
          editable: isEditable,
          resizable: true,
          cellClassRules: cellClassRules,
          ...columnConfig,
        } as ColDef;
        return colDef;
      })
      .filter((col) => col);
  }

  private getColumnType(dataType: string): string[] {
    //Handle here for now, untill we migrate all column types
    let dataTypeName = this.normalizeName(dataType);

    if (dataType === ColumnDataType.Text) {
      return [];
    }

    if (dataType === ColumnDataType.Boolean) {
      dataTypeName = 'boolean';
    }

    if (dataType === ColumnDataType.Decimal) {
      dataTypeName = 'number';
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

    const isExpression = (column.default_value as string)
      .toString()
      .startsWith('=');

    if (isExpression || column.data_type === ColumnDataType.Boolean) {
      isEditable = false;
    }

    // if (
    //   this.utils.hasAttributeRuleFromType(
    //     attr.attributeRules,
    //     AttributeRuleType.EDIT_RULE,
    //     context
    //   )
    // ) {
    //   isEditable = false;
    // }
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
}
