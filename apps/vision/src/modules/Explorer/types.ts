import { PageSize } from '@vision/modules/Common/Components/FileTable/types';
import { VisionFileFilterProps } from '@vision/modules/FilterSidePanel/types';
import { GenericTabularState } from '@vision/store/genericTabularDataSlice';

import { FileInfo } from '@cognite/sdk';

export type ExplorerFileState = Omit<
  FileInfo,
  | 'externalId'
  | 'dataSetid'
  | 'securityCategories'
  | 'createdTime'
  | 'uploadedTime'
  | 'lastUpdatedTime'
  | 'sourceCreatedTime'
  | 'sourceModifiedTime'
> & {
  // Override FileInfo timings in Date to unix timestamps as numbers
  createdTime: number;
  lastUpdatedTime: number;
  sourceCreatedTime?: number;
  uploadedTime?: number;
  linkedAnnotations: string[];
};

export type ExplorerState = GenericTabularState & {
  query: string;
  filter: VisionFileFilterProps;
  showFilter: boolean;
  showFileUploadModal: boolean;
  files: {
    byId: Record<number, ExplorerFileState>;
    allIds: number[];
    selectedIds: number[];
  };
  uploadedFileIds: number[];
  loadingAnnotations?: boolean;
  // Creating a separate state to make it not affected by preserved state in local storage
  exploreModal: {
    filter: VisionFileFilterProps;
    query: string;
    focusedFileId: number | null;
    sortMeta: {
      sortKey?: string;
      reverse?: boolean;
      // this default key will override by the last selected choice for the Timestamp column
      defaultTimestampKey?: string;
      currentPage: number;
      pageSize: PageSize;
    };
  };
  percentageScanned: number;
};
