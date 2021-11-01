import React, { ReactFragment } from 'react';

export const CDF_LABEL: Readonly<string> = 'Cognite Data Fusion';
export const EXTRACTION_PIPELINE: Readonly<string> = 'Extraction pipeline';
export const EXTRACTION_PIPELINE_LOWER: Readonly<string> =
  'extraction pipeline';
export const EXTRACTION_PIPELINES: Readonly<string> = 'Extraction pipelines';
export const CONTACTS_DESCRIPTION: Readonly<string> = `Insert contact details for the source system owner and other stakeholders, such as a support team. Enable notification subscription to send e-mail alerts for pipeline issues.`;

export const NAME_LABEL: Readonly<string> = 'Name';
export const ROLE_LABEL: Readonly<string> = 'Role';
export const EMAIL_LABEL: Readonly<string> = 'E-mail';

export const NOTIFICATION_LABEL: Readonly<string> = 'Notifications';
export const NOTIFICATION_HINT: Readonly<string> = `When turned on, the contact will receive an email if the ${EXTRACTION_PIPELINE_LOWER} fails`;
export const CONTACT_NAME_TEST_ID: Readonly<string> = 'contacts-name-';
export const CONTACT_EMAIL_TEST_ID: Readonly<string> = 'contacts-email-';
export const ADD_CONTACT_TEST_ID: Readonly<string> = 'add-contact-btn';

export const CANCEL: Readonly<string> = 'Cancel';
export const CLOSE: Readonly<string> = 'Close';
export const EDIT: Readonly<string> = 'Edit';
export const SAVE: Readonly<string> = 'Save';
export const CREATE: Readonly<string> = 'Create';
export const OK: Readonly<string> = 'OK';
export const BACK: Readonly<string> = 'Back';
export const NEXT: Readonly<string> = 'Next';
export const ADD_CONTACT: Readonly<string> = 'Add another contact';
export const ADD_OWNER: Readonly<string> = 'Add owner';
export const CONTACTS_HINT = `List other extraction pipeline stakeholders, for instance, a support team or the source system owner. Enable notification subscription to send e-mail alerts for pipeline issues.`;

export const REGISTER: Readonly<string> = 'Register';
export const ADD_ROW: Readonly<string> = 'Add row';
export const REMOVE_ROW: Readonly<string> = 'Remove row';
export const REMOVE_CONTACT: Readonly<string> = 'Remove contact';
export const METADATA_DESCRIPTION_LABEL: Readonly<string> =
  'Metadata description';
export const METADATA_CONTENT_LABEL: Readonly<string> = 'Metadata content';
export const METADATA_DESC_HEADING: Readonly<string> = 'Description';
export const METADATA_CONTENT_HEADING: Readonly<string> = 'Content';

export const NO_DATA_SET_ID_SET: Readonly<string> = 'No data set';
export const NO_DATA_SET_ID_SET_TOOLTIP: Readonly<string> =
  'No data set registered';

export const DESCRIPTION_HINT: Readonly<string> =
  'Describe the extraction pipeline data. This field is optional.';
export const DESCRIPTION_LABEL: Readonly<string> = 'Description';

export const INTEGRATION_SCHEDULE_HINT: Readonly<string> =
  'Select the schedule for running the extraction pipeline.';
export const NO_SCHEDULE: Readonly<string> = 'Not defined';

export const NO_RAW_TABLES_MESSAGE: Readonly<string> =
  'No raw tables registered';

export const SERVER_ERROR_TITLE: Readonly<string> =
  'Your changes have not been saved';
export const SERVER_ERROR_CONTENT: Readonly<string> =
  'Please try again later, or contact you system administrator.';

export const EXT_PIPE_TAB_OVERVIEW: Readonly<string> = `Overview`;
export const EXT_PIPE_TAB_RUN_HISTORY: Readonly<string> = `Run history`;
export const CONTACTS: Readonly<string> = 'Contacts';

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
    <a href="https://guides.github.com/features/mastering-markdown/">
      Use markdown for page formatting
    </a>
    .
  </>
);

// Source
export const SOURCE_HINT: Readonly<string> =
  'Enter the name of the extraction pipeline source system.';

export const INTEGRATION_EXTERNAL_ID_HEADING: Readonly<string> = 'External ID';
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
