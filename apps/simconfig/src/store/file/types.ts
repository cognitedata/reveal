import { FileInfo } from '@cognite/sdk';
import { RequestStatus } from 'store/types';
import { LinkWithID } from 'pages/ModelLibrary/types';
import { CalculationConfig } from 'components/forms/ConfigurationForm/types';

type JSONPrimitive =
  | string
  | number
  | boolean
  | CalculationConfigJSONObject
  | null;

export type CalculationConfigJSONObject = { [key: string]: JSONPrimitive };

export interface FileState {
  requestStatus: RequestStatus;
  initialized: boolean;
  files: FileInfoSerializable[];
  selectedFile?: FileInfoSerializable;
  currentCalculation?: FileInfoSerializable;
  downloadLinks?: LinkWithID[];
  currentCalculationConfig?: CalculationConfig;
}

export type FileInfoSerializable = Omit<
  FileInfo,
  'createdTime' | 'lastUpdatedTime' | 'uploadedTime'
> & {
  createdTime?: number;
  lastUpdatedTime?: number;
  uploadedTime?: number;
};
