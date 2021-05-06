import * as yup from 'yup';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { CRON_REQUIRED, cronValidator } from 'utils/validation/cronValidation';
import { RawTableOptions } from 'pages/create/RawTablePage';
import { DataSetOptions } from 'pages/create/DataSetPage';

export const NAME_REQUIRED: Readonly<string> = 'Integration name is required';
export const MAX_DESC_LENGTH: Readonly<number> = 500;
export const MAX_DOCUMENTATION_LENGTH: Readonly<number> = 500;
export const nameRule = {
  name: yup.string().required(NAME_REQUIRED),
};
export const CONTACT_NAME_REQUIRED: Readonly<string> = 'Name is required';
export const contactNameRule = {
  name: yup.string().required(CONTACT_NAME_REQUIRED),
};
export const CONTACT_EMAIL_REQUIRED: Readonly<string> = 'Email is required';
export const emailRule = {
  email: yup.string().required(CONTACT_EMAIL_REQUIRED),
};
export const roleRule = {
  role: yup.string(),
};
export const sentNotificationRule = {
  sendNotification: yup.boolean(),
};
export const nameSchema = yup.object().shape(nameRule);
export const contactNameSchema = yup.object().shape(contactNameRule);
export const contactEmailSchema = yup.object().shape(emailRule);
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
export const documentationSchema = yup.object().shape({
  documentation: yup
    .string()
    .max(
      MAX_DOCUMENTATION_LENGTH,
      `Documentation can only contain ${MAX_DESC_LENGTH} characters`
    ),
});
export const TABLE_REQUIRED: Readonly<string> = 'Select a database table';
export const RAW_TABLE_REQUIRED: Readonly<string> = 'Raw table is required';
export const selectedRawTablesRule = {
  selectedRawTables: yup.array().of(
    yup.object().shape({
      databaseName: yup.string(),
      tableName: yup.string(),
    })
  ),
};
export const rawTableRules = {
  rawTable: yup.string().required(RAW_TABLE_REQUIRED),
  selectedRawTables: yup
    .array()
    .of(
      yup.object().shape({
        databaseName: yup.string(),
        tableName: yup.string(),
      })
    )
    .when('rawTable', {
      is: (val: RawTableOptions) => val === RawTableOptions.YES,
      then: yup.array().min(1, TABLE_REQUIRED),
    }),
};
export const rawTableSchema = yup.object().shape(rawTableRules);
const MAX_INPUT_LENGTH = 255;
export const sourceRule = {
  source: yup
    .string()
    .max(
      MAX_INPUT_LENGTH,
      `Source can only contain ${MAX_INPUT_LENGTH} characters`
    ),
};

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
