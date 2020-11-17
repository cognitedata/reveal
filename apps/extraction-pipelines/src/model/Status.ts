import moment from 'moment';
import { Integration } from './Integration';

export enum Status {
  OK = 'OK',
  FAIL = 'FAIL',
  SEEN = 'SEEN',
  NOT_ACTIVATED = 'Not activated',
}
export interface StatusObj {
  status: Status;
  time: moment.Moment | null;
}
export type LastStatuses = Pick<Integration, 'lastSuccess' | 'lastFailure'>;
export interface LatestStatusesDateTime {
  successDateTime: moment.Moment | null;
  failDateTime: moment.Moment | null;
}
