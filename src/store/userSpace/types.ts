import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum UserSpaceActionTypes {
  USER_SPACE_LOAD = 'userSpace/LOAD',
  USER_SPACE_LOADED = 'userSpace/LOADED',
  USER_SPACE_LOAD_ERROR = 'userSpace/ERROR',
  USER_SPACE_REQUEST_SUCCESS = 'userSpace/REQUEST_SUCCESS',
  USER_SPACE_UPDATE = 'userSpace/UPDATE',
  USER_SPACE_UPDATE_ERROR = 'userSpace/UPDATE_ERROR',
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
  error?: string;
  lastVisited?: LastVisited[];
}
