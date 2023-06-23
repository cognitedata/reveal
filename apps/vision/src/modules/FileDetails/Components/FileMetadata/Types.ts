import { ReactText } from 'react';

import { FileInfo } from '@cognite/sdk';

// ToDo: remove { directory?: string } once FileInfo have been properly updated with directory field
export type VisionFileDetails = Omit<FileInfo, 'metadata'> & {
  directory?: string;
};

export type VisionFileInfo = VisionFileDetails & {
  metadata: MetadataItem[];
};

export interface MetadataItem {
  metaKey: string;
  metaValue: ReactText;
}
export type VisionFileDetailKey = keyof VisionFileDetails;
