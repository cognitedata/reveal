import { FileInfo } from '@cognite/sdk';
import { ReactText } from 'react';

// ToDo: remove { directory?: string } once FileInfo have been properly updated with directory field
export type VisionFileDetails = Omit<FileInfo, 'metadata'> & {
  directory?: string;
};

export type VisionFileInfo = VisionFileDetails & {
  metadata: MetadataItem[];
};

export interface MetadataItem {
  key: string;
  value: ReactText;
}
export type VisionFileDetailKey = keyof VisionFileDetails;
