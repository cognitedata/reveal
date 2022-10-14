import {
  actions as dataManagementActions,
  DraftRowData,
} from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export const useDraftRows = () => {
  const dispatch = useDispatch();

  const setDraftRows = useCallback(
    (rows: DraftRowData[]) => () => {
      dispatch(dataManagementActions.setDraftRowsData({ rows: [...rows] }));
    },
    [dispatch]
  );

  const createNewDraftRow = useCallback(() => {
    dispatch(dataManagementActions.createNewDraftRow());
  }, [dispatch]);

  const clearState = useCallback(() => {
    dispatch(dataManagementActions.clearState());
  }, [dispatch]);

  const updateRowData = useCallback(
    (payload: { row: DraftRowData; field: string; newValue: string }) => {
      dispatch(dataManagementActions.updateRowData(payload));
    },
    [dispatch]
  );
  const removeDrafts = useCallback(
    (ids: string[]) => {
      dispatch(dataManagementActions.removeDraftRows({ rows: ids }));
    },
    [dispatch]
  );
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

  return {
    setDraftRows,
    createNewDraftRow,
    updateRowData,
    removeDrafts,
    setSelectedType,
    deleteSelectedRows,
    clearState,
  };
};
