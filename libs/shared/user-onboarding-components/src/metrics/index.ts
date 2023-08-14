export enum ORIENTATION_ACTIONS {
  STARTED = 'Started',
  NEXT = 'Next',
  PREVIOUS = 'Previous',
  LAST_STEP = 'Last step',
  CLOSED = 'Closed',
}

export const ORIENTATION_EVENT = 'Orientation';

export enum ONBOARDING_MODAL_ACTIONS {
  STARTED = 'Started',
  CLOSED = 'Closed',
  CANCELLED = 'Cancelled',
  SUCCESS = 'Success',
}

export const ONBOARDING_MODAL_EVENT = 'Onboarding modal';

export type OrientationEvent = typeof ORIENTATION_EVENT;
