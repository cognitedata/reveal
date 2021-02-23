import * as yup from 'yup';
import { parseCron } from '../cronUtils';

export const CRON_INVALID = `Invalid cron expression`;
export const CRON_REQUIRED: Readonly<string> = 'Cron is required';

export const cronValidator = (value: string = '', context: any) => {
  try {
    parseCron(value);
    return true;
  } catch (e) {
    return context.createError({
      message: `${CRON_INVALID}: ${value}`,
      path: 'cron',
    });
  }
};

export const cronSchema = yup.object().shape({
  cron: yup
    .string()
    .required(CRON_REQUIRED)
    .test('cron-expression', 'Cron not valid', cronValidator),
});
