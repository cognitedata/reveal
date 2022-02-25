import { Document } from '@cognite/sdk-playground';

import { LAST_CREATED_KEY_VALUE } from '../keys';

export const addCreatedDate = (doc: Document) => {
  return {
    ...doc,
    createdDate: doc.sourceFile[LAST_CREATED_KEY_VALUE],
  };
};
