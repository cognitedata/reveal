import { RequestStatus } from 'store/types';
import { FileInfo } from 'components/forms/ModelForm/types';

export interface FileState {
  requestStatus: RequestStatus;
  initialized: boolean;
  files: FileInfo[];
  selectedFile?: Omit<FileInfo, 'createdTime' | 'lastUpdatedTime'> & {
    createdTime?: string;
    lastUpdatedTime?: string;
  };
}
