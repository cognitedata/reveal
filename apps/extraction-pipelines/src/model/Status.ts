import { Integration } from './Integration';

export enum RunStatusUI {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
  SEEN = 'Seen',
  NOT_ACTIVATED = 'Not activated',
}

export enum RunStatusAPI {
  SUCCESS = 'success',
  FAILURE = 'failure',
  SEEN = 'seen',
}

export interface StatusObj {
  status: RunStatusUI;
  time: number;
}
export type LastStatuses = Pick<Integration, 'lastSuccess' | 'lastFailure'>;
