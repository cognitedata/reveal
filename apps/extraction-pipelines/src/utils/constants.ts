export const CDF_LABEL: Readonly<string> = 'CDF';
export const EMAIL_NOTIFICATION_TOOLTIP: Readonly<string> =
  'If checked, the person will receive e-mail notification when an integration run fails. To edit, please click Edit button.';

export const CONTACTS_DESCRIPTION: Readonly<string> =
  'Document contacts related to the integrations. This will help getting in touch with the right people on troubleshooting';
export const NAME_LABEL: Readonly<string> = 'Name';
export const NAME_PLACEHOLDER: Readonly<string> = 'Enter name';
export const ROLE_LABEL: Readonly<string> = 'Role';
export const ROLE_PLACEHOLDER: Readonly<string> = 'Enter role';
export const EMAIL_LABEL: Readonly<string> = 'E-mail';
export const EMAIL_PLACEHOLDER: Readonly<string> = 'Enter email address';
export const NOTIFICATION_LABEL: Readonly<string> = 'Notification subscription';
export const NOTIFICATION_HINT: Readonly<string> =
  'When turned on, the contact will receive an email if the integration fails';

export const CONTACT_NAME_TEST_ID: Readonly<string> = 'contacts-name-';
export const CONTACT_EMAIL_TEST_ID: Readonly<string> = 'contacts-email-';
export const CONTACT_ROLE_TEST_ID: Readonly<string> = 'contacts-role-';
export const CONTACT_NOTIFICATION_TEST_ID: Readonly<string> =
  'contacts-sendNotification-';
export const ADD_CONTACT_TEST_ID: Readonly<string> = 'add-contact-btn';

export const REMOVE: Readonly<string> = 'Remove';
export const CANCEL: Readonly<string> = 'Cancel';
export const CLOSE: Readonly<string> = 'Close';
export const EDIT: Readonly<string> = 'Edit';
export const SAVE: Readonly<string> = 'Save';
export const OK: Readonly<string> = 'OK';
export const BACK: Readonly<string> = 'Back';
export const NEXT: Readonly<string> = 'Next';
export const ADD_CONTACT: Readonly<string> = 'Add another contact';
export const ADD_OWNER: Readonly<string> = 'Add owner';
export const CONTACTS_HINT =
  'Contacts could be someone responsible for a relevant application or persons to contact if there is an issue with the integration. Please mark if the contact should recieve a notification if there is an issue.';
export const OWNER_HINT =
  'The owner of an integration is the person responsible for the integration';
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
export const NO_META_DATA: Readonly<string> = 'No metadata registered';
export const NO_SCHEDULE: Readonly<string> = 'Not defined';
export const NO_CONTACTS_MSG: Readonly<string> = 'No contacts registered';
export const NO_RAW_TABLES_MESSAGE: Readonly<string> =
  'No raw tables registered';

export const SERVER_ERROR_TITLE: Readonly<string> =
  'Your changes have not been saved';
export const SERVER_ERROR_CONTENT: Readonly<string> =
  'Please try again later, or contact you system administrator.';

export const WIZARD_HEADING: Readonly<string> = 'Create integration wizard';
export const NOTIFICATION_DIALOG_TITLE: Readonly<string> =
  'One contact with email notification';
export const NOTIFICATION_DIALOG_CONTENT: Readonly<string> =
  'The integration must have at least one contact with email notification activated. This is in case of failures with the integration. If you would like to change contacts click edit to update.';

export const REMOVE_DIALOG_TEXT_PART: Readonly<string> =
  'Are you sure you want to remove';

export const INTEGRATION_OVERVIEW: Readonly<string> = 'Integration overview';
export const DETAILS: Readonly<string> = 'Integration details';
export const HEALTH: Readonly<string> = 'Integration health';
export const CONTACTS: Readonly<string> = 'Contacts';

// Data set
export const DATA_SET_ID_HINT: Readonly<string> =
  'Type in the name or id of your data set';
export const DATA_SETS_LABEL: Readonly<string> = 'Data sets';
// Documentation
export const DOCUMENTATION_HINT: Readonly<string> =
  'Please add any relevant documentation.';

// Source
export const SOURCE_HINT: Readonly<string> =
  '**** Source hint placeholder ****';
export const SOURCE_LABEL: Readonly<string> = 'Source';

// Page headings
export const ADD_INTEGRATION: Readonly<string> = 'Add integration';

// Tracking constants
export const ACTION: Readonly<string> = 'Action';
export const ACTION_COPY: Readonly<string> = 'Action.Copy'; // + copyType
export const ACTION_DOWNLOAD: Readonly<string> = 'Action.Download'; // + download name
export const ACTION_EDIT: Readonly<string> = 'Action.Edit'; // + field and value
export const ACTION_REGISTER: Readonly<string> = 'Action.Register';
export const FILTER: Readonly<string> = 'Filter'; // + field and value
export const INTEGRATIONS: Readonly<string> = 'Overview'; // + tenant
export const NAVIGATION: Readonly<string> = 'Navigation'; // + href
export const SEARCH: Readonly<string> = 'Search'; // + query
export const SINGLE_INTEGRATION: Readonly<string> = 'Integration.Details'; // + id
export const SINGLE_INTEGRATION_RUNS: Readonly<string> = 'Integration.Runs'; // + id
export const SORT: Readonly<string> = 'Sort'; // + field

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
