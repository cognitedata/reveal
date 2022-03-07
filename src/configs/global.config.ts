import { TagColor } from 'src/components/Tag';

export const globalConfig = {
  APP_NAME: 'Document Classifiers',
  VERSION: '1.0',
  DOCUMENT_ERROR_THRESHOLD: 0,
  DOCUMENT_WARNING_THRESHOLD: 25,

  DOCUMENT_THRESHOLD_TOOLTIP: {
    primary: 'The label has enough documents to perform a classification.',
    warning:
      'The label does not have enough documents to to perform a classification. Please try adding more.',
    error: 'Classifications can not be completed without any documents.',
  } as { [x in TagColor]: string },
} as const;

export const documentConfig = {
  FILE_PREVIEW_TITLE: 'File Preview',

  POPCONFIRM_TEXT:
    'Do you want to delete these documents from the label? This action is irreversible.',

  IMAGE_ERROR: 'Image preview not possible...',
  IMAGE_LOADING: 'Loading image preview...',
} as const;

export const homeConfig = {
  EMPTY_TABLE_TITLE: 'This list is empty',
  EMPTY_TABLE_DESCRIPTION: 'You currently don’t have any trained models.',
  DESCRIPTION:
    'Here you will find a list of your document classifiers. Document classifiers help you automatically label your documents.',
} as const;

export const loadingState = {
  TITLE: 'Loading data...',

  FIRST_DESCRIPTION: 'Hold up, fetching your data from the backend',
  SECOND_DESCRIPTION: 'This is taking a bit longer than expected',
  THIRD_DESCRIPTION: 'This is taking too long. Try refreshing the page',
} as const;

export const trainingConfig = {
  INFO_BAR:
    'Training a classifier might take some time – You can go back to the homepage and deploy the model when it is ready',
} as const;

export const noAccessConfig = {
  TITLE: 'Request access to Document Classifiers',
  TITLE_DESCRIPTION:
    'You do not have access to view this page yet. Check the access right needed below',

  PERMISSION_TITLE: 'You need the following capabilities:',

  PERMISSION_SUBTITLE_1:
    'Ask those response within your organization for access management to grant them to you',
  PERMISSION_SUBTITLE_2: 'Learn more about access management in ',
  documentation: {
    TITLE: 'documentation',
    URL: 'https://docs.cognite.com/dev/guides/iam/authorization.html#capabilities',
  },
} as const;
