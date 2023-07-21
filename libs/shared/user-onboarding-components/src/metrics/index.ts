export enum ORIENTATION_ACTIONS {
  STARTED = 'Started',
  NEXT = 'Next',
  PREVIOUS = 'Previous',
  LAST_STEP = 'Last step',
  CLOSED = 'Closed',
}

export const ORIENTATION_EVENT = 'Orientation';

export type OrientationEvent = typeof ORIENTATION_EVENT;
