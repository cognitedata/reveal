import { CogniteExternalId } from '@cognite/sdk';
import { createAction } from 'typesafe-actions';
import { LayoutActionTypes, BoardLayoutPayloadItem } from './types';

export const layoutsLoading = createAction(
  LayoutActionTypes.LAYOUT_LOADING
)<void>();

export const layoutsLoaded = createAction(LayoutActionTypes.LAYOUT_LOADED)<
  BoardLayoutPayloadItem[]
>();

export const layoutsSaving = createAction(
  LayoutActionTypes.LAYOUT_SAVING
)<void>();

export const layoutsSaved = createAction(LayoutActionTypes.LAYOUT_SAVED)<
  BoardLayoutPayloadItem[]
>();

export const layoutError = createAction(LayoutActionTypes.LAYOUT_ERROR)<void>();

export const addLayoutItemToDeleteQueue = createAction(
  LayoutActionTypes.LAYOUT_ADD_TO_DELETE_QUEUE
)<CogniteExternalId>();

export const resetLayoutDeleteQueue = createAction(
  LayoutActionTypes.LAYOUT_RESET_DELETE_QUEUE
)<void>();
