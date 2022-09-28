/* eslint-disable no-param-reassign */
import { generateId } from '@platypus-app/utils/uuid';
import {
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  KeyValueMap,
} from '@platypus/platypus-core';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DraftRowData extends KeyValueMap {
  externalId: string;
  _draftStatus: 'Draft' | 'Completed';
  _isDraftSelected: boolean;
}

export type DraftRows = { [TypeKey: string]: DraftRowData[] };

export interface IDataManagementState {
  dataModelExternalId: string | null;
  selectedVersion: string | null;
  selectedType: DataModelTypeDefsType | null;
  draftRows: DraftRows;
  shouldShowDraftRows: boolean;
  shouldShowPublishedRows: boolean;
}

const initialState = {
  dataModelExternalId: null,
  selectedVersion: null,
  selectedType: null,
  draftRows: {} as DraftRows,
  shouldShowDraftRows: true,
  shouldShowPublishedRows: true,
} as IDataManagementState;

const getDefaultCellValueForDraftRow = (field: DataModelTypeDefsField) => {
  if (field.type.list) {
    return [];
  }
  if (field.type.name === 'Boolean') {
    return false;
  }
  return null;
};

export const isDraftRowDataComplete = (
  draftRowData: DraftRowData,
  dataModelType: DataModelTypeDefsType
): boolean => {
  for (const field of dataModelType.fields) {
    const isFieldNameInDraftRow = Object.keys(draftRowData).includes(
      field.name
    );
    if (!isFieldNameInDraftRow)
      throw new Error(
        `Field name "${field.name}" is not present in draft row with externalId "${draftRowData.externalId}"`
      );

    // if field is non-nullable and the value is null, undefined, or '', return false
    if (
      field.type.nonNull &&
      field.nonNull &&
      [null, undefined, ''].includes(
        draftRowData[field.name] as null | undefined
      )
    ) {
      return false;
    }
  }

  return true;
};

const dataManagementSlice = createSlice({
  name: 'data-management',
  initialState: initialState,
  reducers: {
    setSelectedType: (
      state,
      action: PayloadAction<{
        dataModelExternalId: string;
        selectedVersion: string;
        selectedType: DataModelTypeDefsType;
      }>
    ) => {
      state.dataModelExternalId = action.payload.dataModelExternalId;
      state.selectedVersion = action.payload.selectedVersion;
      state.selectedType = action.payload.selectedType;
    },

    setDraftRowsData: (
      state,
      { payload: { rows } }: PayloadAction<{ rows: DraftRowData[] }>
    ) => {
      const selectedType = state.selectedType;
      if (!selectedType) return;

      state.draftRows[selectedType.name] = rows;
    },

    setDraftRowsDataByTypeName: (
      state,
      {
        payload: { typeName, rows },
      }: PayloadAction<{ typeName: string; rows: DraftRowData[] }>
    ) => {
      const selectedType = state.selectedType;
      if (!selectedType) return;

      state.draftRows[typeName] = rows;
    },

    createNewDraftRow: (state) => {
      const selectedType = state.selectedType;
      if (!selectedType) return;

      const existingRows = state.draftRows[selectedType.name] || [];
      const newRow: DraftRowData = selectedType.fields.reduce(
        (rowObj, field) => {
          return {
            ...rowObj,
            [field.name]: getDefaultCellValueForDraftRow(field),
          };
        },
        {
          externalId: generateId(),
          _draftStatus: 'Draft',
          _isDraftSelected: false,
        }
      );
      // if all fields are non-required, indicate that it is a completed draft row
      if (isDraftRowDataComplete(newRow, selectedType)) {
        newRow._draftStatus = 'Completed';
      }
      state.draftRows[selectedType.name] = [newRow, ...existingRows];
    },

    updateRowData: (
      state,
      action: PayloadAction<{
        row: DraftRowData;
        field: string;
        newValue: string;
      }>
    ) => {
      const selectedType = state.selectedType;
      if (!selectedType) return;

      const { row, field, newValue } = action.payload;
      const updatedRowIdx = state.draftRows[selectedType.name].findIndex(
        (row) => row.externalId === action.payload.row.externalId
      );
      const updatedRow = {
        ...row,
        [field]: newValue,
      };
      state.draftRows[selectedType.name][updatedRowIdx] = {
        ...updatedRow,
        _draftStatus:
          state.selectedType &&
          isDraftRowDataComplete(updatedRow, state.selectedType)
            ? 'Completed'
            : 'Draft',
      };
    },
    deleteSelectedDraftRows: (state) => {
      const selectedTypeName = state.selectedType?.name as string;

      state.draftRows[selectedTypeName] = state.draftRows[
        selectedTypeName
      ].filter((row) => !row._isDraftSelected);
    },
    removeDraftRows: (state, action: PayloadAction<{ rows: string[] }>) => {
      const { rows } = action.payload;
      const selectedType = state.selectedType;
      if (selectedType) {
        state.draftRows[selectedType.name] = state.draftRows[
          selectedType.name
        ].filter((row) => !rows.includes(row.externalId));
      }
    },
    clearState: () => initialState,
    toggleShouldShowDraftRows: (state) => {
      state.shouldShowDraftRows = !state.shouldShowDraftRows;
    },

    toggleShouldShowPublishedRows: (state) => {
      state.shouldShowPublishedRows = !state.shouldShowPublishedRows;
    },
  },
});

export type DataManagementState = ReturnType<
  typeof dataManagementSlice.reducer
>;

export const { actions } = dataManagementSlice;
export default dataManagementSlice;

export const compatiblizeDraftRowsData = (
  draftRows: DraftRowData[],
  dataModelType: DataModelTypeDefsType
): DraftRowData[] => {
  // omits fields not part of the type anymore and add newly added fields from the type
  const compatibleDraftRows = draftRows.map((draftRowData: DraftRowData) => {
    return dataModelType.fields.reduce((compatibleRowObj, field) => {
      return {
        ...compatibleRowObj,
        externalId: draftRowData['externalId'],
        _draftStatus: draftRowData['_draftStatus'],
        _isDraftSelected: draftRowData['_isDraftSelected'] === true,
        [field.name]:
          field.name in draftRowData
            ? draftRowData[field.name]
            : getDefaultCellValueForDraftRow(field),
      };
    }, {} as DraftRowData);
  });

  return compatibleDraftRows;
};
