import { v3 } from '@cognite/cdf-sdk-singleton';
import { ReactText } from 'react';

export type VisionFileDetails = Omit<v3.FileInfo, 'metadata'>;
export type VisionFileInfo = VisionFileDetails & {
  metadata: MetadataItem[];
};

export interface MetadataItem {
  key: string;
  value: ReactText;
}
