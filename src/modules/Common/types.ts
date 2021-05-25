import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { ColumnShape } from 'react-base-table';

import { Annotation, JobStatus, VisionAPIType } from 'src/api/types';

export interface AnnotationPreview
  extends Pick<
    Annotation,
    'id' | 'annotatedResourceId' | 'status' | 'source' | 'text'
  > {
  annotationType: VisionAPIType;
}
export type AnnotationCounts = {
  modelGenerated?: number;
  manuallyGenerated?: number;
  verified?: number;
  rejected?: number;
  unhandled?: number;
};

export type AnnotationStatuses = {
  status: JobStatus;
  statusTime: number;
};

export interface AnnotationsBadgeCounts {
  gdpr?: AnnotationCounts;
  tag?: AnnotationCounts;
  text?: AnnotationCounts;
  objects?: AnnotationCounts;
}
export interface AnnotationsBadgeStatuses {
  gdpr?: AnnotationStatuses;
  tag?: AnnotationStatuses;
  text?: AnnotationStatuses;
  objects?: AnnotationStatuses;
}

export type FileActions = {
  showMetadataPreview: (fileId: number) => void;
  onReviewClick?: (fileId: number) => void;
};

export type ResultData = Pick<
  FileInfo,
  'id' | 'mimeType' | 'name' | 'sourceCreatedTime' | 'geoLocation'
> &
  TableDataItem;

export type TableDataItem = Pick<
  FileInfo,
  'id' | 'mimeType' | 'name' | 'sourceCreatedTime'
> & {
  menu: FileActions;
  selected: boolean;
};

export type CellRenderer = {
  rowData: TableDataItem;
  column: ColumnShape<TableDataItem>;
  rowIndex: number;
  cellData: any;
};

export type ViewMode = 'list' | 'grid' | 'map';
