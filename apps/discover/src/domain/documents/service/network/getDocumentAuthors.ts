import { DocumentError } from '../types';
import { getDocumentSDKClient } from '../utils/getDocumentSDKClient';

export const documentError: DocumentError = {
  error: true,
};

export const getDocumentAuthors = () => {
  return getDocumentSDKClient().aggregate.allUniqueValues({
    properties: [{ property: ['author'] }],
  });
};
