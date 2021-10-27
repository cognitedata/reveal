import { FileInfo } from '@cognite/sdk';
import { RequestStatus } from 'store/types';
import { LinkWithID } from 'pages/ModelLibrary/types';

type JSONPrimitive = string | number | boolean | JSONObject | null;

type JSONObject = { [key: string]: JSONPrimitive };

export interface FileState {
  requestStatus: RequestStatus;
  initialized: boolean;
  files: FileInfoSerializable[];
  selectedFile?: FileInfoSerializable;
  selectedCalculation?: FileInfoSerializable;
  downloadLinks?: LinkWithID[];
  selectedCalculationConfig?: JSONObject;
}

export type FileInfoSerializable = Omit<
  FileInfo,
  'createdTime' | 'lastUpdatedTime' | 'uploadedTime'
> & {
  createdTime?: number;
  lastUpdatedTime?: number;
  uploadedTime?: number;
};
