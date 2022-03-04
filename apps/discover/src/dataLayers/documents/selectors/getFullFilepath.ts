import { Document } from '@cognite/sdk-playground';

import { getFilepath } from './getFilepath';

export const getFullFilepath = (file: Document) => {
  return getFilepath(file) + file.sourceFile.name;
};
