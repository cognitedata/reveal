import { Document } from '@cognite/sdk';

export const addCreatedDate = (doc: Document) => {
  return {
    ...doc,
    createdDate: doc.createdTime,
  };
};
