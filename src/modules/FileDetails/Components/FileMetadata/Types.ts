import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { ReactText } from 'react';

export type VisionFileDetails = Omit<FileInfo, 'metadata'>;
export type VisionFileInfo = VisionFileDetails & {
  metadata: MetadataItem[];
};

export interface MetadataItem {
  key: string;
  value: ReactText;
}
export type VisionFileDetailKey = keyof VisionFileDetails;
