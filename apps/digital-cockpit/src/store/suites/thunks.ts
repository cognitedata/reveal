/* eslint-disable no-console */
import { CdfClient, ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
import { setNotification } from 'store/notification/actions';
import { setHttpError } from 'store/notification/thunks';
import * as Sentry from '@sentry/browser';
import { CogniteExternalId } from '@cognite/sdk';
import { Metrics } from '@cognite/metrics';
import { updateSuitesOrder } from 'utils/suitesTable';
import { Board, Suite } from './types';
import * as actions from './actions';

export const fetchSuites =
  (apiClient: ApiClient, metrics?: Metrics) =>
  async (dispatch: RootDispatcher) => {
    dispatch(actions.loadSuitesTable());
    try {
      const suites: Suite[] = await apiClient.getSuites();
      dispatch(actions.loadedSuitesTable(suites as Suite[]));
    } catch (e) {
      dispatch(actions.loadSuitesTableFailed());
      if (e?.code === 403 && metrics) {
        metrics.track('NotAuthorizedUser');
      } else {
        dispatch(setHttpError(`Failed to fetch suites`, e));
        Sentry.captureException(e);
      }
    }
  };

export const insertSuite =
  (apiClient: ApiClient, suite: Suite, showNotification = true) =>
  async (dispatch: RootDispatcher) => {
    dispatch(actions.saveSuite());
    try {
      await apiClient.saveSuite(suite);
      await dispatch(fetchSuites(apiClient));
      showNotification &&
        dispatch(setNotification(['Saved.', 'Please edit & save the layout']));
    } catch (e) {
      dispatch(actions.suiteError());
      dispatch(setHttpError('Failed to save a suite', e));
      Sentry.captureException(e);
    }
  };

export const deleteSuite =
  (apiClient: ApiClient, key: string) => async (dispatch: RootDispatcher) => {
    try {
      dispatch(actions.deleteSuite());
      await apiClient.deleteSuite(key);
      dispatch(fetchSuites(apiClient));
      dispatch(setNotification('Deleted successfully'));
    } catch (e) {
      dispatch(actions.suiteError());
      dispatch(setHttpError('Failed to delete a suite', e));
      Sentry.captureException(e);
    }
  };

export function deleteFiles(
  client: CdfClient,
  fileExternalIds: CogniteExternalId[]
) {
  return async (dispatch: RootDispatcher) => {
    try {
      await client.deleteFiles(fileExternalIds);
    } catch (e) {
      Sentry.captureException(e);
      dispatch(
        setHttpError(
          `Failed to delete image preview(s): ${fileExternalIds.join(',')}`,
          e
        )
      );
    }
  };
}

export const fetchImageUrls =
  (client: CdfClient, ids: string[]) => async (dispatch: RootDispatcher) => {
    try {
      dispatch(actions.fetchImgUrls());
      const imgUrls = await client.getDownloadUrls(ids);
      dispatch(actions.fetchedImgUrls(imgUrls));
    } catch (e) {
      dispatch(actions.fetchImgUrlsFailed());
      dispatch(setHttpError('Failed to fetch image urls ', e));
      Sentry.captureException(e);
    }
  };

export const changeAndSaveSuitesOrder =
  (apiClient: ApiClient, suites: Suite[], newOrder: string[]) =>
  async (dispatch: RootDispatcher) => {
    const suitesToReplace = updateSuitesOrder(suites, newOrder);
    if (!suitesToReplace.length) {
      return;
    }
    dispatch(actions.replaceSuites(suitesToReplace));
    dispatch(saveSuitesSilently(apiClient, suitesToReplace));
  };

function saveSuitesSilently(apiClient: ApiClient, suites: Suite[]) {
  return async (dispatch: RootDispatcher) => {
    try {
      await apiClient.updateSuites(suites);
    } catch (e) {
      dispatch(setHttpError(`Failed to update suites`, e));
      Sentry.captureException(e);
    }
  };
}

// moves a board from a source suite to a target suite
export function moveBoard(
  apiClient: ApiClient,
  board: Board,
  source: Suite,
  target: Suite
) {
  return async (dispatch: RootDispatcher) => {
    const updatedSource = {
      ...source,
      boards: source.boards.filter(({ key }: Board) => board.key !== key),
    };
    const updatedTarget = {
      ...target,
      boards: [...target.boards, board],
    };
    const suitesToUpdate = [updatedSource, updatedTarget];
    try {
      await apiClient.updateSuites(suitesToUpdate);
      dispatch(actions.replaceSuites(suitesToUpdate));
    } catch (e) {
      dispatch(setHttpError(`Failed to update suites`, e));
      Sentry.captureException(e);
    }
  };
}
