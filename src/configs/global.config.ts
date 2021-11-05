import { TagColor } from 'components/Tag';

export const globalConfig = {
  DOCUMENT_ERROR_THRESHOLD: 0,
  DOCUMENT_WARNING_THRESHOLD: 25,

  DOCUMENT_THRESHOLD_TOOLTIP: {
    primary: 'You have enough documents to perform a classifications',
    warning:
      'The data set has missing data sets to give a correct evaluation, please add some more.',
    error: 'Classifications can not be completed without any data sets.',
  } as { [x in TagColor]: string },
};

export const documentConfig = {
  FILE_PREVIEW_TITLE: 'File Preview',

  POPCONFIRM_TEXT:
    'Do you want to delete these documents from the label? This action is irreversible.',

  IMAGE_ERROR: 'Image preview not possible...',
  IMAGE_LOADING: 'Loading image preview...',
};

export const homeConfig = {
  EMPTY_TABLE_TITLE: 'This list is empty',
  EMPTY_TABLE_DESCRIPTION: 'You currently don’t have any trained models.',
  DESCRIPTION:
    'Here you will find a list of your document classifiers. Document classifiers help you automatically label your documents.',
};

export const loadingState = {
  TITLE: 'Loading data...',

  FIRST_DESCRIPTION: 'Hold up, fetching your data from the backend',
  SECOND_DESCRIPTION: 'This is taking a bit longer than expected',
  THIRD_DESCRIPTION: 'This is taking too long. Try refreshing the page',
};
