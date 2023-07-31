import { RootDispatcher } from 'store/types';
import { ApiClient } from 'utils';
import { mapGridWidgetToBoardLayout } from 'utils/layout';
import { MixedHttpError, setHttpError } from 'store/notification/thunks';
import { setNotification } from 'store/notification/actions';
import * as Sentry from '@sentry/browser';
import { GridStackWidget } from 'gridstack';
import { CogniteExternalId } from '@cognite/sdk';

import { BoardLayoutPayloadItem, BoardLayoutResponse } from './types';
import * as actions from './actions';

export function loadLayouts(apiClient: ApiClient) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.layoutsSaving());
    try {
      const { layouts = [] } =
        (await apiClient.getLayout()) as BoardLayoutResponse;
      dispatch(actions.layoutsLoaded(layouts));
    } catch (e) {
      const error = e as MixedHttpError;
      dispatch(actions.layoutError());
      dispatch(setHttpError('Failed to load layout configuration', error));
      Sentry.captureException(e);
    }
  };
}

export function saveGridWidgetItems(
  apiClient: ApiClient,
  gridLayout: GridStackWidget[]
) {
  const boardLayout = mapGridWidgetToBoardLayout(gridLayout);
  return saveBoardLayout(apiClient, boardLayout);
}

export function saveBoardLayout(
  apiClient: ApiClient,
  boardLayout: BoardLayoutPayloadItem[]
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.layoutsSaving());
    try {
      await apiClient.saveLayout(boardLayout);
      dispatch(actions.layoutsSaved(boardLayout));
      dispatch(setNotification('Layout saved'));
    } catch (e) {
      const error = e as MixedHttpError;
      dispatch(actions.layoutError());
      dispatch(setHttpError('Failed to save layout configuration', error));
      Sentry.captureException(e);
    }
  };
}

export function deleteLayoutItems(
  apiClient: ApiClient,
  items: CogniteExternalId[]
) {
  return async (dispatch: RootDispatcher) => {
    if (!items.length) return;
    try {
      await apiClient.deleteLayoutItems(items);
    } catch (e) {
      const error = e as MixedHttpError;
      dispatch(actions.layoutError());
      dispatch(setHttpError('Failed to delete layout items', error));
      Sentry.captureException(e);
    } finally {
      dispatch(actions.resetLayoutDeleteQueue());
    }
  };
}
