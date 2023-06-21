// state helper functions

import { FileInfo } from '@cognite/sdk';
import { VisionFile } from 'src/modules/Common/store/files/types';

// convert to state
export const createFileState = (file: FileInfo): VisionFile => {
  return {
    ...file,
    createdTime: file.createdTime?.getTime(),
    uploadedTime: file.uploadedTime?.getTime(),
    lastUpdatedTime: file.lastUpdatedTime?.getTime(),
    sourceCreatedTime: file.sourceCreatedTime?.getTime(),
    linkedAnnotations: [],
  };
};

export const VisionFilesToFileState = (visionFileList: FileInfo[]) =>
  Object.assign(
    {},
    ...visionFileList.map((visionFile: FileInfo) => {
      const fileId = visionFile.id.toString();
      return {
        [fileId]: createFileState(visionFile),
      };
    })
  );

// convert from state helper functions

export const createFileInfo = (file: VisionFile): FileInfo => {
  return {
    ...file,
    id: Number(file.id),
    createdTime: new Date(file.createdTime),
    uploadedTime: file.uploadedTime ? new Date(file.uploadedTime) : undefined,
    lastUpdatedTime: new Date(file.lastUpdatedTime),
    sourceCreatedTime: file.sourceCreatedTime
      ? new Date(file.sourceCreatedTime)
      : undefined,
  };
};
