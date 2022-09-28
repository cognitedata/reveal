/* eslint-disable no-prototype-builtins */
import { ColumnConfig, GridConfig } from '@cognite/cog-data-grid';
import { KeyValueMap, DataModelTypeDefsType } from '@platypus/platypus-core';
import { CheckboxCellRenderer } from '../components/DataPreviewTable/cell-renderers/CheckboxCellRenderer';
import { IdCellRenderer } from '../components/DataPreviewTable/cell-renderers/IdCellRenderer';

const colTypesMap: KeyValueMap = {
  Boolean: 'BOOLEAN',
  String: 'TEXT',
  Int: 'NUMBER',
  Float: 'DECIMAL',
};

export const getInitialGridConfig = () => {
  return {
    columns: [],
    customFunctions: [],
    dataSources: [],
  } as GridConfig;
};

export const buildGridConfig = (
  instanceIdCol: string,
  dataModelType: DataModelTypeDefsType,
  onRowAdd: (row: KeyValueMap) => void
): GridConfig => {
  return {
    ...getInitialGridConfig(),
    columns: [
      {
        label: '',
        property: '_isDraftSelected',
        defaultValue: '',
        dataType: 'TEXT',
        colDef: {
          editable: false,
          sortable: false,
          suppressMovable: true,
          cellRenderer: CheckboxCellRenderer,
          headerComponent: () => '',
          width: 44,
        },
      },
      {
        label: 'Instances',
        property: instanceIdCol,
        defaultValue: '',
        dataType: 'TEXT',
        colDef: {
          editable: false,
          sortable: false,
          suppressMovable: true,
          cellRenderer: IdCellRenderer,
          cellRendererParams: {
            onRowAdd,
          },
          cellStyle: {
            padding: '0 var(--ag-cell-horizontal-padding)',
          },
        },
      },
      ...dataModelType.fields.map((field) => {
        const colConfig = {
          label: field.name,
          property: field.name,
          dataType: colTypesMap.hasOwnProperty(field.type.name)
            ? colTypesMap[field.type.name]
            : 'CUSTOM',
          optional: field.nonNull,
          defaultValue: '',
          rules: [],
          metadata: {},
          colDef: {
            sortable: false,
            cellEditorParams: {
              isRequired: field.nonNull,
            },
          },
        } as ColumnConfig;

        return colConfig;
      }),
    ],
  };
};
