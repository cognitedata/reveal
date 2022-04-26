import { getHumanReadableFileSize } from 'utils/number';

import { Document } from '@cognite/sdk';

export const getFilesize = (doc: Document) => {
  return getHumanReadableFileSize(doc.sourceFile.size);
};
