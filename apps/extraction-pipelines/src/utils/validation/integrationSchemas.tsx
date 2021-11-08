import * as yup from 'yup';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { CRON_REQUIRED, cronValidator } from 'utils/validation/cronValidation';
import { EXTRACTION_PIPELINE } from 'utils/constants';

export const NAME_REQUIRED: Readonly<string> = `${EXTRACTION_PIPELINE} name is required`;
export const MAX_DESC_LENGTH: Readonly<number> = 500;
export const MAX_DOCUMENTATION_LENGTH: Readonly<number> = 10000;
export const nameRule = {
  name: yup.string().required(NAME_REQUIRED),
};
export const CONTACT_NAME_REQUIRED: Readonly<string> = 'Name is required';
export const contactNameRule = {
  name: yup.string().required(CONTACT_NAME_REQUIRED),
};
export const CONTACT_EMAIL_REQUIRED: Readonly<string> = 'Email is required';
export const emailRule = {
  email: yup.string().email().required(CONTACT_EMAIL_REQUIRED),
};
// export const roleNotOwnerRule = {
//   role: yup.string().lowercase().not(['owner']),
// };
export const roleRule = {
  role: yup.string(), // .is(['Owner']),
};
export const sentNotificationRule = {
  sendNotification: yup.boolean(),
};
export const nameSchema = yup.object().shape(nameRule);
export const contactNameSchema = yup.object().shape(contactNameRule);
export const contactEmailSchema = yup.object().shape(emailRule);
// export const contactRoleNotOwnerSchema = yup.object().shape(roleNotOwnerRule);
export const contactRoleSchema = yup.object().shape(roleRule);
export const contactSendNotificationSchema = yup
  .object()
  .shape(sentNotificationRule);
export const contactSchema = yup.object().shape({
  ...contactNameRule,
  ...emailRule,
  ...roleRule,
  ...sentNotificationRule,
});

export const META_DESC_REQUIRED: Readonly<string> = 'Description is required';
export const META_CONTENT_REQUIRED: Readonly<string> = 'Content is required';
export const metaDescriptionRule = {
  description: yup.string().required(META_DESC_REQUIRED),
};
export const metaContentRule = {
  content: yup.string().required(META_CONTENT_REQUIRED),
};
export const metaDescriptionSchema = yup.object().shape({
  ...metaDescriptionRule,
});
export const metaContentSchema = yup.object().shape({
  ...metaContentRule,
});
export const metaDataSchema = yup.object().shape({
  ...metaDescriptionRule,
  ...metaContentRule,
});

export const descriptionSchema = yup.object().shape({
  description: yup
    .string()
    .required('Description is required')
    .max(
      MAX_DESC_LENGTH,
      `Description can only contain ${MAX_DESC_LENGTH} characters`
    ),
});
export const descriptionRule = {
  description: yup.string(),
};
export const scheduleRule = {
  schedule: yup.string(),
  cron: yup.string().when('schedule', {
    is: (val: SupportedScheduleStrings) =>
      val === SupportedScheduleStrings.SCHEDULED,
    then: yup
      .string()
      .required(CRON_REQUIRED)
      .test('cron-expression', 'Cron not valid', cronValidator),
  }),
};
export const scheduleSchema = yup.object().shape(scheduleRule);
export const documentationRule = {
  documentation: yup
    .string()
    .max(
      MAX_DOCUMENTATION_LENGTH,
      `Documentation can only contain ${MAX_DOCUMENTATION_LENGTH} characters`
    ),
};
export const documentationSchema = yup.object().shape(documentationRule);
export const selectedRawTablesRule = {
  selectedRawTables: yup.array().of(
    yup.object().shape({
      databaseName: yup.string(),
      tableName: yup.string(),
    })
  ),
};
const MAX_INPUT_LENGTH = 255;
export const sourceRule = {
  source: yup
    .string()
    .max(
      MAX_INPUT_LENGTH,
      `Source can only contain ${MAX_INPUT_LENGTH} characters`
    ),
};
export const sourceSchema = yup.object().shape(sourceRule);
export enum DataSetOptions {
  YES = 'Yes',
  NO = 'No',
  CREATE = 'Create',
}
export const DATA_SET_REQUIRED: Readonly<string> = 'Data set is required';
export const datasetSchema = yup.object().shape({
  dataset: yup.string().required(DATA_SET_REQUIRED),
  dataSetId: yup.string().when('dataset', {
    is: (val: DataSetOptions) => val === DataSetOptions.YES,
    then: yup.string().required(DATA_SET_REQUIRED),
  }),
});

export const dataSetIdSchema = yup.object().shape({
  dataSetId: yup.number().required(DATA_SET_REQUIRED),
});

export const EXTERNAL_ID_REQUIRED: Readonly<string> = 'External id is required';
export const externalIdRule = {
  externalId: yup.string().required(EXTERNAL_ID_REQUIRED),
};
