/* eslint-disable no-prototype-builtins */
import {
  ColumnConfig,
  ColumnDataType,
  GridConfig,
} from '@cognite/cog-data-grid';
import { DataModelTypeDefsType, KeyValueMap } from '@platypus/platypus-core';
import { CheckboxCellRenderer } from '../components/DataPreviewTable/cell-renderers/CheckboxCellRenderer';
import { CustomCellRenderer } from '../components/DataPreviewTable/cell-renderers/CustomCellRenderer';
import { IdCellRenderer } from '../components/DataPreviewTable/cell-renderers/IdCellRenderer';

const colTypesMap: KeyValueMap = {
  Boolean: ColumnDataType.Boolean,
  String: ColumnDataType.Text,
  Int: ColumnDataType.Number,
  Float: ColumnDataType.Decimal,
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
  onRowAdd: (row: KeyValueMap) => void,
  enableDeletion: boolean,
  enableManualPopulation: boolean
): GridConfig => {
  const columns: ColumnConfig[] = enableDeletion
    ? [
        {
          label: '',
          property: '_isDraftSelected',
          defaultValue: '',
          dataType: ColumnDataType.Text,
          colDef: {
            editable: false,
            sortable: false,
            suppressMovable: true,
            cellRenderer: CheckboxCellRenderer,
            headerComponent: () => '',
            width: 44,
          },
        },
      ]
    : [];

  columns.push(
    {
      label: 'Instances',
      property: instanceIdCol,
      defaultValue: '',
      dataType: ColumnDataType.Text,
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
      const isList = field.type.list || false;

      const colConfig = {
        label: field.name,
        property: field.name,
        dataType: colTypesMap.hasOwnProperty(field.type.name)
          ? colTypesMap[field.type.name]
          : ColumnDataType.Custom,
        optional: field.nonNull,
        defaultValue: '',
        rules: [],
        metadata: {},
        isList,
        colDef: {
          headerName: `${field.name}${field.type.nonNull ? '*' : ''}`,
          // Mixer API supports sorting only on primitives (not array and not custom types)
          sortable: !field.type.custom && !isList,
          editable: enableManualPopulation && !isList,
          cellEditorParams: {
            isRequired: field.nonNull || field.type.nonNull,
          },
          ...(!colTypesMap.hasOwnProperty(field.type.name) &&
            !isList && {
              cellRenderer: CustomCellRenderer,
            }),
        },
      } as ColumnConfig;

      return colConfig;
    })
  );

  return { ...getInitialGridConfig(), columns: columns };
};
