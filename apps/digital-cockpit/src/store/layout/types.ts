import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type BoardLayout = {
  x?: number; // x coordinate
  y?: number; // y coordinate
  w: number; // width
  h: number; // height
};

export type BoardLayoutItem = {
  layout: BoardLayout;
  key: string;
};

export type BoardLayoutPayloadItem = BoardLayoutItem & {
  lastUpdatedTime?: string;
  createdTime?: string;
};

export type BoardLayoutResponse = {
  layouts: BoardLayoutPayloadItem[];
};

export enum LayoutActionTypes {
  LAYOUT_LOADING = 'layout/LOADING',
  LAYOUT_LOADED = 'layout/LOADED',
  LAYOUT_SAVING = 'layout/SAVING',
  LAYOUT_SAVED = 'layout/SAVED',
  LAYOUT_ERROR = 'layout/ERROR',
  LAYOUT_ADD_TO_DELETE_QUEUE = 'layout/ADD_TO_DELETE_QUEUE',
  LAYOUT_RESET_DELETE_QUEUE = 'layout/RESET_DELETE_QUEUE',
}

export type LayoutRootAction = ActionType<typeof actions>;

export type LayoutState = {
  layouts: BoardLayoutPayloadItem[];
  deleteQueue: string[];
  loading: boolean;
  saving: boolean;
};

export type GridLayout = Record<string, BoardLayout>;
