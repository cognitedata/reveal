import { SupportedScheduleStrings } from '@extraction-pipelines/components/extpipes/cols/Schedule';
import {
  CRON_REQUIRED,
  cronValidator,
} from '@extraction-pipelines/utils/validation/cronValidation';
import * as yup from 'yup';

export const NAME_REQUIRED: Readonly<string> = `Extraction pipeline name is required`;
export const MAX_DOCUMENTATION_LENGTH: Readonly<number> = 10000;
export const nameRule = {
  name: yup.string().required(NAME_REQUIRED).max(140),
};
export const dataSetIdRule = {
  dataSetId: yup.number().required('Data set is required'),
};
export const nameSchema = yup.object().shape(nameRule);
export const META_DESC_REQUIRED: Readonly<string> = 'Description is required';
export const META_CONTENT_REQUIRED: Readonly<string> = 'Content is required';
export const metaDescriptionRule = {
  description: yup.string().required(META_DESC_REQUIRED).max(500),
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
  externalId: yup.string().required(EXTERNAL_ID_REQUIRED).max(255),
};
