import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DataModelTypeDefsType } from '@platypus/platypus-core';

import {
  actions as dataManagementActions,
  DraftRowData,
} from '../../../../redux/reducers/global/dataManagementReducer';

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
  const setSelectedType = useCallback(
    (
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
    },
    [dispatch]
  );

  const deleteSelectedRows = useCallback(
    () => dispatch(dataManagementActions.deleteSelectedDraftRows()),
    [dispatch]
  );

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
