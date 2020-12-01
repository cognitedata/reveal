import { Integration } from './Integration';

export enum Status {
  OK = 'OK',
  FAIL = 'FAIL',
  SEEN = 'SEEN',
  NOT_ACTIVATED = 'Not activated',
}
export interface StatusObj {
  status: Status;
  time: number;
}
export type LastStatuses = Pick<Integration, 'lastSuccess' | 'lastFailure'>;
