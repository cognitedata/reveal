import { rootInjector, TOKENS } from '@platypus-app/di';
import { StorageProviderType } from '@platypus/platypus-core';
import { Action, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit';
import {
  actions,
  compatiblizeDraftRowsData,
} from '../reducers/global/dataManagementReducer';

const getLocalStorageProvider = () =>
  rootInjector
    .get(TOKENS.storageProviderFactory)
    .getProvider(StorageProviderType.localStorage);

export const draftRowsLocalStorageMiddleware =
  (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    const result = next(action);
    const state = store.getState();
    const localStorageProvider = getLocalStorageProvider();

    if (
      actions.setSelectedType.match(action) &&
      Object.keys(state.dataManagement.draftRows).length < 1
    ) {
      const keyPrefix = `DRAFT-ROW-DATA::${state.dataManagement.dataModelExternalId}_${state.dataManagement.selectedVersion}_`;
      const selectedDataModelKeys = localStorageProvider
        .getKeys()
        .filter((key: string) => key.startsWith(keyPrefix));

      for (const key of selectedDataModelKeys) {
        const typeNameFromKey = key.substring(keyPrefix.length);
        const draftRows = localStorageProvider.getItem(key) || [];

        store.dispatch(
          actions.setDraftRowsDataByTypeName({
            typeName: typeNameFromKey,
            rows: draftRows,
          })
        );
      }
    }

    if (
      actions.setSelectedType.match(action) &&
      Object.keys(state.dataManagement.draftRows).length > 0
    ) {
      store.dispatch(
        actions.setDraftRowsData({
          rows: compatiblizeDraftRowsData(
            state.dataManagement.draftRows[action.payload.selectedType.name] ||
              null,
            action.payload.selectedType
          ),
        })
      );
    }

    if (
      actions.setDraftRowsData.match(action) ||
      actions.createNewDraftRow.match(action) ||
      actions.updateRowData.match(action) ||
      actions.deleteSelectedDraftRows.match(action) ||
      actions.removeDraftRows.match(action)
    ) {
      const lsKey = `DRAFT-ROW-DATA::${state.dataManagement.dataModelExternalId}_${state.dataManagement.selectedVersion}_${state.dataManagement.selectedType.name}`;

      const draftRows =
        state.dataManagement.draftRows[
          state.dataManagement.selectedType.name
        ] || undefined;
      draftRows && localStorageProvider.setItem(lsKey, draftRows);
    }
    return result;
  };
