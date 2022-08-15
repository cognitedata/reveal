import React, { ReactFragment } from 'react';
import { ExternalLink } from 'components/links/ExternalLink';
import { OptionType } from '@cognite/cogs.js';

export const CDF_LABEL: Readonly<string> = 'Cognite Data Fusion';
export const EXTRACTION_PIPELINE: Readonly<string> = 'Extraction pipeline';
export const EXTRACTION_PIPELINE_LOWER: Readonly<string> =
  'extraction pipeline';
export const EXTRACTION_PIPELINES: Readonly<string> = 'Extraction pipelines';

export const NAME_LABEL: Readonly<string> = 'Name';
export const ROLE_LABEL: Readonly<string> = 'Role';
export const EMAIL_LABEL: Readonly<string> = 'E-mail';

export const NOTIFICATION_LABEL: Readonly<string> = 'Notifications';

export const CANCEL: Readonly<string> = 'Cancel';
export const CLOSE: Readonly<string> = 'Close';
export const EDIT: Readonly<string> = 'Edit';
export const SAVE: Readonly<string> = 'Save';
export const CREATE: Readonly<string> = 'Create';
export const OK: Readonly<string> = 'OK';
export const BACK: Readonly<string> = 'Back';
export const NEXT: Readonly<string> = 'Next';
export const CONTACTS_HINT = `List other extraction pipeline stakeholders, for instance, a support team or the source system owner. Enable notification subscription to send e-mail alerts for pipeline issues.`;

export const REGISTER: Readonly<string> = 'Register';
export const METADATA_DESC_HEADING: Readonly<string> = 'Key';
export const METADATA_CONTENT_HEADING: Readonly<string> = 'Value';

export const NO_DATA_SET_ID_SET: Readonly<string> = 'No data set';
export const NO_DATA_SET_ID_SET_TOOLTIP: Readonly<string> =
  'No data set registered';

export const DESCRIPTION_HINT: Readonly<string> =
  'Describe the extraction pipeline data. This field is optional.';
export const DESCRIPTION_LABEL: Readonly<string> = 'Description';

export const EXTPIPE_SCHEDULE_HINT: Readonly<string> =
  'Select the schedule that is set up in the extractor.';

export const NO_RAW_TABLES_MESSAGE: Readonly<string> =
  'No raw tables registered';

export const SERVER_ERROR_TITLE: Readonly<string> =
  'Your changes have not been saved';
export const SERVER_ERROR_CONTENT: Readonly<string> =
  'Please try again later, or contact you system administrator.';

export const EXT_PIPE_TAB_OVERVIEW: Readonly<string> = `Overview`;
export const EXT_PIPE_TAB_RUN_HISTORY: Readonly<string> = `Run history`;

// name
export const NAME_HINT = `Enter a descriptive name for the ${EXTRACTION_PIPELINE_LOWER}.`;
export const EXT_PIPE_NAME_HEADING: Readonly<string> = `${EXTRACTION_PIPELINE} name`;

// Data set
export const DATA_SET_ID_HINT: Readonly<string> =
  'Select the data set the extraction pipeline feeds data into.';
export const DATA_SETS_LABEL: Readonly<string> = 'Data sets';
// Documentation
export const DOCUMENTATION_HINT: Readonly<ReactFragment> = (
  <>
    Add other documentation to provide context and insights about the extraction
    pipeline.{' '}
    <ExternalLink href="https://guides.github.com/features/mastering-markdown/">
      Use markdown for page formatting
    </ExternalLink>
  </>
);

export const EXTPIPE_EXTERNAL_ID_HEADING: Readonly<string> = 'External ID';
export const EXTERNAL_ID_HINT: Readonly<string> = `Enter a unique identifier. Use this ID when setting up status and heartbeat reporting for extractors.`;

// error msg
export const ERROR_NOT_GET_EXT_PIPE: Readonly<string> = `Could not get ${EXTRACTION_PIPELINES}`;

export const BtnTestIds = {
  EDIT_BTN: 'edit-btn-',
  REMOVE_BTN: 'remove-btn-',
  CANCEL_BTN: 'cancel-btn-',
  SAVE_BTN: 'save-btn-',
};
export const ContactBtnTestIds = {
  EDIT_BTN: 'edit-contact-btn-',
  REMOVE_BTN: 'remove-contact-btn-',
  CANCEL_BTN: 'cancel-contact-btn-',
  SAVE_BTN: 'save-contact-btn-',
};

export const DEFAULT_ITEMS_PER_PAGE = 100;
export const PAGINATION_OPTIONS: OptionType<unknown>[] = [
  {
    label: '10',
    value: 10,
  },
  {
    label: '25',
    value: 25,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
  {
    label: '250',
    value: 250,
  },
];
