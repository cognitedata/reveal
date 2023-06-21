import { FileInfo } from '@cognite/sdk';
import { Files } from 'src/modules/Common/store/files/types';
import { createFileState } from 'src/store/util/StateUtils';

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
