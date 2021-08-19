import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { VisibleAnnotation } from 'src/modules/Review/previewSlice';
import { AnnotationCollection } from 'src/modules/Common/Components/CollectionSettingsModal/CollectionSettingsTypes';
import { AnnotationStatus, KeypointItem } from 'src/utils/AnnotationUtils';
import { ReactText } from 'react';
import { OptionType } from '@cognite/cogs.js';

export type TO_COMPLETE = number;
export type COLLECTION_LENGTH = number;

export type FilePreviewProps = {
  fileInfo: FileInfo;
  annotations: VisibleAnnotation[];
  onCreateAnnotation: (annotation: any) => void;
  onUpdateAnnotation: (annotation: any) => void;
  onDeleteAnnotation: (annotation: any) => void;
  handleInEditMode: (inEditMode: boolean) => void;
  editable?: boolean;
  creatable?: boolean;
  handleAddToFile?: () => void;
};

export type KeypointItemCollection = {
  id: string;
  keypoints: KeypointItem[];
  name: string;
  show: boolean;
  status: AnnotationStatus;
  selected: boolean;
};

export type ReactImageAnnotateWrapperProps = FilePreviewProps & {
  fileInfo: FileInfo;
  annotations: VisibleAnnotation[];
  onCreateAnnotation: (annotation: any) => void;
  onUpdateAnnotation: (annotation: any) => void;
  onDeleteAnnotation: (annotation: any) => void;
  handleInEditMode: (inEditMode: boolean) => void;
  editable?: boolean;
  creatable?: boolean;
  handleAddToFile?: () => void;
  collection: AnnotationCollection;
  currentShape: string;
  nextKeyPoint: { collectionName: string; orderNumber: number };
  currentCollection: KeypointItemCollection | null;
  haveThumbnailCarousel: boolean;
};

export type AnnotationTableRowProps = {
  annotation: AnnotationTableItem;
  onSelect: (id: ReactText) => void;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApprove: (
    annotation: AnnotationTableItem,
    status: AnnotationStatus
  ) => void;
};

export type AnnotationTableItem = Omit<VisibleAnnotation, 'id'> & {
  id: ReactText;
};

export type VisionOptionType<T> = OptionType<T> & {
  order?: string;
  color?: string;
};
