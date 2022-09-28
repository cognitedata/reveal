import {
  actions as dataManagementActions,
  DraftRowData,
} from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { useDispatch } from 'react-redux';

export const useDraftRows = () => {
  const dispatch = useDispatch();

  const setDraftRows = (rows: DraftRowData[]) => {
    dispatch(dataManagementActions.setDraftRowsData({ rows: [...rows] }));
  };

  const createNewDraftRow = () => {
    dispatch(dataManagementActions.createNewDraftRow());
  };

  const clearState = () => {
    dispatch(dataManagementActions.clearState());
  };

  const updateRowData = (payload: {
    row: DraftRowData;
    field: string;
    newValue: string;
  }) => {
    dispatch(dataManagementActions.updateRowData(payload));
  };
  const removeDrafts = (ids: string[]) => {
    dispatch(dataManagementActions.removeDraftRows({ rows: ids }));
  };
  const setSelectedType = (
    dataModelExternalId: string,
    selectedVersion: string,
    selectedType: DataModelTypeDefsType
  ) => {
    dispatch(
      dataManagementActions.setSelectedType({
        dataModelExternalId,
        selectedVersion,
        selectedType,
      })
    );
  };

  const deleteSelectedRows = () =>
    dispatch(dataManagementActions.deleteSelectedDraftRows());

  const toggleShouldShowDraftRows = () =>
    dispatch(dataManagementActions.toggleShouldShowDraftRows());

  const toggleShouldShowPublishedRows = () =>
    dispatch(dataManagementActions.toggleShouldShowPublishedRows());

  return {
    setDraftRows,
    createNewDraftRow,
    updateRowData,
    removeDrafts,
    setSelectedType,
    deleteSelectedRows,
    clearState,
    toggleShouldShowDraftRows,
    toggleShouldShowPublishedRows,
  };
};
