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

export interface FeatureModuleConfig {
  name: string;
  path: string;
  enabled: boolean;
}

export interface FeatureModule {
  moduleName: string;
  init: () => void;
  initStore?: () => any;
}

export interface PlatypusError {
  code: number;
  message: string;
}

export interface AuthenticatedUser {
  user: string;
  project: string;
  projectId: string;
}
