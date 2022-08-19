import { CogDataGrid } from '@cognite/cog-data-grid';
import { Button } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  BuiltInType,
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  UpdateDataModelFieldDTO,
} from '@platypus/platypus-core';
import {
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ValueSetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useTypeDefFieldsGrid } from '../../hooks/useTypeDefFieldsGrid';
import { useTypeDefsKeyboardActions } from '../../hooks/useTypeDefsKeyboardActions';
import { DataModelFieldsGrid } from './elements';

export interface TypeDefFieldsProps {
  currentType: DataModelTypeDefsType;
  builtInTypes: BuiltInType[];
  customTypesNames: string[];
  disabled: boolean;
  onFieldCreated: (fieldName: string, fieldId: string) => void;
  onFieldUpdated: (
    fieldName: string,
    field: Partial<UpdateDataModelFieldDTO>
  ) => void;
  onFieldRemoved: (fieldName: string) => void;
}

/**
 * Component that handles Data Model Type fields.
 * Contains only the logic for managing fields, does not interact with redux.
 */
export const TypeDefFields = ({
  currentType,
  builtInTypes,
  customTypesNames,
  disabled,
  onFieldCreated,
  onFieldRemoved,
  onFieldUpdated,
}: TypeDefFieldsProps) => {
  const { t } = useTranslation('TypeDefFields');
  const gridRef = useRef<AgGridReact>(null);
  const gridService = useTypeDefFieldsGrid();
  const { onCellFocused } = useTypeDefsKeyboardActions();

  const handleCellEditRequest = useCallback(
    (e: ValueSetterParams) => {
      const fieldData = e.data as DataModelTypeDefsField;
      const updatedCol = e.colDef.field as string;
      const updatedFieldName =
        updatedCol === 'name' && e.newValue ? e.newValue : fieldData.name;

      if (e.oldValue === e.newValue) {
        return false;
      }

      let updatedData = {
        ...fieldData,
        name: updatedFieldName,
        [updatedCol]: e.newValue,
      };

      if (updatedCol === 'nonNull') {
        const isCustomType =
          customTypesNames.filter((name) => name === fieldData.type.name)
            .length > 0;

        updatedData = {
          ...updatedData,
          type: {
            ...fieldData.type,
            nonNull: !isCustomType ? e.newValue : false,
          },
          nonNull: !isCustomType ? e.newValue : false,
        };
      }

      if (!fieldData.name && updatedCol === 'name' && e.newValue) {
        onFieldCreated(updatedFieldName, fieldData.id!);
      } else {
        onFieldUpdated(fieldData.name, updatedData);
      }

      e.api.sizeColumnsToFit();

      const rowIdx = e.node?.rowIndex as number;
      const field = e.colDef.field as string;

      if (rowIdx >= 0 && field === 'type') {
        // focus cell after edit
        setTimeout(() => {
          e.api.sizeColumnsToFit();
          e.api.setFocusedCell(rowIdx, field);
        });
      }

      // this is important, we want to cancel edit
      // The grid will be updated from redux
      // read more here
      // https://blog.ag-grid.com/adding-removing-rows-columns-ag-grid-with-react-redux-toolkit/
      return false;
    },
    // keep currentType as dependency as well, we need this callback to be updated when currentType updates
    // eslint-disable-next-line
    [onFieldUpdated, onFieldCreated, currentType, customTypesNames]
  );

  const handleFieldAddClick = useCallback(() => {
    const gridApi = (gridRef.current as any)!.api as GridApi;
    const newRow: DataModelTypeDefsField = {
      // generate new unique id
      // this id is only valid while editor is opened
      // on next parse, name will be used
      id: btoa(Date.now().toString()),
      name: '',
      nonNull: false,
      type: {
        name: 'String',
        list: false,
        nonNull: false,
      },
    };
    gridApi.applyTransaction({ add: [newRow] });

    const idx = gridApi.getDisplayedRowCount() - 1;

    // wait until state was updated (redux) and then just focus the cell
    setTimeout(() => {
      gridApi.startEditingCell({
        rowIndex: idx > -1 ? idx : 0,
        colKey: 'name',
      });
    });
  }, []);

  const handleDelete = useCallback(
    (field: DataModelTypeDefsField) => {
      const gridApi = (gridRef.current as any)!.api as GridApi;
      const totalRows = gridApi.getDisplayedRowCount();

      const addRowIfEmpty = () => {
        // if after removing all rows, the type has no fields
        // create one
        if (totalRows - 1 === 0) {
          // wait until state was updated (redux) and then just focus the cell
          setTimeout(() => {
            handleFieldAddClick();
          });
        }
      };

      // if user added new row without name
      // then it is only added locally in the grid and not in redux
      if (!field.name) {
        gridApi.applyTransaction({ remove: [field] });
        addRowIfEmpty();
        return false;
      }
      onFieldRemoved(field.name);
      addRowIfEmpty();
      return false;
    },
    [onFieldRemoved, handleFieldAddClick]
  );

  const isRequiredDisabled = useCallback(
    (field: DataModelTypeDefsField) => {
      const isCustomType =
        customTypesNames.filter((name) => name === field.type.name).length > 0;
      return disabled || isCustomType;
    },
    [disabled, customTypesNames]
  );

  const handleGridReady = useCallback(
    (e: GridReadyEvent) => {
      e.api.sizeColumnsToFit();

      // if the type has no fields, create one and start editing
      if (!currentType.fields.length && gridRef.current) {
        handleFieldAddClick();
      }
    },
    [currentType.fields.length, handleFieldAddClick]
  );

  // Cache Grid Columns config
  // Grid will re-render every time when they are changed
  // We want to control the flow when cols will be updated
  const typeDefsConfig = useMemo(
    () =>
      gridService.getGridConfig({
        builtInTypes,
        customTypesNames,
        disabled,
        isRequiredDisabled,
        onDelete: handleDelete,
      }),
    // Regenerate colDefs this only and only when this are changed
    // Otherwise, if colDefs are changed, the whole grid will re-render
    // eslint-disable-next-line
    [disabled, isRequiredDisabled, handleDelete]
  );

  return (
    <DataModelFieldsGrid>
      <CogDataGrid
        theme={'compact'}
        ref={gridRef}
        columnTypes={{
          // just a placeholder for type since we are creating new column here
          FIELD_ACTIONS: {},
        }}
        defaultColDef={{
          // There is a really weird issue when using ag-gird in combination with redux-toolkit
          // Regular events don't work as expected (cell is re-rendered before cellEditRequest)
          // This creates bad UX because for a moment you see old value and than updated one.
          // The fix is to set default value setter, to cancel the edit
          // and there to dispatch the events to store
          valueSetter: handleCellEditRequest,
        }}
        context={{
          typeFieldNames: currentType.fields.map((field) => ({
            id: field.id,
            name: field.name,
          })),
        }}
        // this prop instruct the grid to autosize and set the height=contents
        domLayout={'autoHeight'}
        singleClickEdit={true}
        suppressCellFocus={false}
        stopEditingWhenCellsLoseFocus={true}
        editType={''}
        //This prop tells to the grid that we are working with immutable data
        getRowId={(params: GetRowIdParams) => {
          // notice id, this is generated by us
          const key = params.data.id ? params.data.id : params.data.name;
          return key || 'undefined';
        }}
        data={currentType.fields}
        config={typeDefsConfig}
        onGridReady={handleGridReady}
        onCellFocused={onCellFocused}
        onGridSizeChanged={(e) => e.api.sizeColumnsToFit()}
      />
      {!disabled && (
        <Button
          icon="Add"
          iconPlacement="left"
          aria-label={t('add_field', 'Add field')}
          type="ghost"
          disabled={
            disabled || currentType?.fields.some((field) => !field.name)
          }
          style={{
            alignSelf: 'flex-start',
            marginBottom: '8px',
            marginLeft: '-8px', // aligned with the fields
            padding: '4px 8px 4px 8px',
          }}
          onClick={handleFieldAddClick}
        >
          {t('add_field', 'Add field')}
        </Button>
      )}
    </DataModelFieldsGrid>
  );
};
