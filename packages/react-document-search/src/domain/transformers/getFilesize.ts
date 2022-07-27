import { Document } from '@cognite/sdk';

import { getHumanReadableFileSize } from '../../utils/getHumanReadableFileSize';

export const getFilesize = (doc: Document) => {
  return getHumanReadableFileSize(doc.sourceFile.size);
};
