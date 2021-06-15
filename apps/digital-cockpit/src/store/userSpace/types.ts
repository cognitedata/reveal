import { ApplicationItem } from 'store/config/types';
import { Board } from 'store/suites/types';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum UserSpaceActionTypes {
  USER_SPACE_LOAD = 'userSpace/LOAD',
  USER_SPACE_LOADED = 'userSpace/LOADED',
  USER_SPACE_LOAD_ERROR = 'userSpace/ERROR',
  LAST_VISITED_UPDATE = 'userSpace/LAST_VISITED_UPDATE',
  LAST_VISITED_UPDATED = 'userSpace/LAST_VISITED_UPDATED',
  LAST_VISITED_UPDATE_ERROR = 'userSpace/LAST_VISITED_UPDATE_ERROR',
}

export type UserSpaceRootAction = ActionType<typeof actions>;

export type LastVisited = {
  key: string;
  lastVisitedTime: number;
};

export type UserSpacePayload = {
  lastVisited?: LastVisited[];
};

export interface UserSpaceState {
  loading: boolean;
  loaded: boolean;
  lastVisited?: LastVisited[];
}

export type LastVisitedItem = (Board | ApplicationItem) & {
  lastVisitedTime?: number;
  itemType?: 'board' | 'application' | '';
};
