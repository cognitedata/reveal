import { StepInfo } from './types';

export const STEPS = {
  CREDS_FORM: 1,
  SCHEDULE_FORM: 2,
  RETRY_ERROR_STEP: 3,
  SUCCESS: 4,
};

export const DEFAULT_STEP_INFO: StepInfo = {
  currentStep: STEPS.CREDS_FORM,
  loading: false,
};

export const STEP_WIDTH: Record<number, number> = {
  1: 620,
  2: 908,
  3: 604,
  4: 620,
};

export const DEFAULT_VALUES = {
  clientId: '',
  clientSecret: '',
  cdfCredsMode: 'USER_CREDS' as const,
  period: 1,
  periodType: { value: 'hours', label: 'Hour(s)' },
};
