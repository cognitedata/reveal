import * as yup from 'yup';

export const HOURS_MIN_MSG: Readonly<string> = 'Hours can be minimum 1 hour';
export const HOURS_MAX_MSG: Readonly<string> = 'Hours can be maximum 24 hours';
export const HOURS_REQUIRED: Readonly<string> = 'Hours is required';
export const MIN_IN_HOURS: Readonly<number> = 60;

export const skipNotificationRule = {
  skipNotificationInHours: yup.number().when('hasConfig', {
    is: (val: boolean) => val,
    then: yup
      .number()
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? undefined : value
      )
      .min(1, HOURS_MIN_MSG)
      .max(24, HOURS_MAX_MSG)
      .required(HOURS_REQUIRED),
  }),
};
