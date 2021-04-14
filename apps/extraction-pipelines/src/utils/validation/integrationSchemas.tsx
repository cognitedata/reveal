import * as yup from 'yup';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { CRON_REQUIRED, cronValidator } from 'utils/validation/cronValidation';

export const NAME_REQUIRED: Readonly<string> = 'Integration name is required';
export const MAX_DESC_LENGTH: Readonly<number> = 500;
export const MAX_DOCUMENTATION_LENGTH: Readonly<number> = 500;
const SCHEDULE_REQUIRED: Readonly<string> = 'Schedule is required';
export const nameRule = {
  name: yup.string().required(NAME_REQUIRED),
};
export const nameSchema = yup.object().shape(nameRule);

export const descriptionSchema = yup.object().shape({
  description: yup
    .string()
    .required('Description is required')
    .max(
      MAX_DESC_LENGTH,
      `Description can only contain ${MAX_DESC_LENGTH} characters`
    ),
});
export const scheduleSchema = yup.object().shape({
  schedule: yup.string().required(SCHEDULE_REQUIRED),
  cron: yup.string().when('schedule', {
    is: (val: SupportedScheduleStrings) =>
      val === SupportedScheduleStrings.SCHEDULED,
    then: yup
      .string()
      .required(CRON_REQUIRED)
      .test('cron-expression', 'Cron not valid', cronValidator),
  }),
});
export const documentationSchema = yup.object().shape({
  documentation: yup
    .string()
    .max(
      MAX_DOCUMENTATION_LENGTH,
      `Documentation can only contain ${MAX_DESC_LENGTH} characters`
    ),
});
