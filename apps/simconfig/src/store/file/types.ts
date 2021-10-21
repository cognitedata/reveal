import { FileInfo } from '@cognite/sdk';
import { RequestStatus } from 'store/types';
import { LinkWithID } from 'pages/ModelLibrary/types';

export interface FileState {
  requestStatus: RequestStatus;
  initialized: boolean;
  files: FileInfoSerializable[];
  selectedFile: FileInfoSerializable | undefined;
  downloadLinks?: LinkWithID[];
}

export type FileInfoSerializable = Omit<
  FileInfo,
  'createdTime' | 'lastUpdatedTime' | 'uploadedTime'
> & {
  createdTime?: number;
  lastUpdatedTime?: number;
  uploadedTime?: number;
};
