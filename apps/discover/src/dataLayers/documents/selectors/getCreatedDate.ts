import { Document } from '@cognite/sdk-playground';

export const getCreatedDate = (doc: Document) => {
  // these keys used to be dynamic, before the sdk typed them
  // but now they are fixed we can use them directly (bonus: we get types)
  return doc.sourceFile.sourceCreatedTime;
};
