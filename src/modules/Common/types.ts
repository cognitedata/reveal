import { ColumnShape } from 'react-base-table';

import { JobStatus } from 'src/api/types';

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

export type TableDataItem = {
  id: number;
  mimeType: string;
  name: string;
  menu: FileActions;
  selected: boolean;
  sourceCreatedTime?: Date;
};

export type CellRenderer = {
  rowData: TableDataItem;
  column: ColumnShape<TableDataItem>;
  rowIndex: number;
  cellData: any;
};
