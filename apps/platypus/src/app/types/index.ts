export enum ActionStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}
export interface StoreAction {
  type: string;
  payload: any;
}

export interface KeyValueStore {
  [key: string]: any;
}

export interface AuthenticatedUser {
  user: string;
  project: string;
  projectId: string;
}
