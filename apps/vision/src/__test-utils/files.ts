import { Files } from '@vision/modules/Common/store/files/types';
import { createFileState } from '@vision/store/util/StateUtils';

import { FileInfo } from '@cognite/sdk';

export const convertToVisionFileState = (fileInfo: FileInfo[]): Files => {
  const files: Files = {
    byId: {},
    allIds: [],
    selectedIds: [],
  };
  fileInfo.forEach((file) => {
    const hasInFiles = !!files.byId[file.id];
    files.byId[file.id] = createFileState(file);
    if (!hasInFiles) {
      files.allIds.push(file.id);
    }
  });
  return files;
};
