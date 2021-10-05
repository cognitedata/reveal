import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { OptionType } from '@cognite/cogs.js';
import { ReactElement, ReactText } from 'react';
import { VisibleAnnotation } from 'src/modules/Review/store/reviewSlice';
import { AnnotationStatus, KeypointItem } from 'src/utils/AnnotationUtils';

export type TO_COMPLETE = number;
export type COLLECTION_LENGTH = number;

export type KeypointItemCollection = {
  id: string;
  keypoints: KeypointItem[];
  name: string;
  show: boolean;
  status: AnnotationStatus;
  selected: boolean;
};

export type Keypoint = {
  caption: string;
  order: string;
  color: string;
  defaultPosition?: [number, number];
};
export type Shape = {
  shapeName: string;
  color: string;
  lastUpdated?: number;
  id?: number;
};
export type AnnotationCollection = {
  predefinedKeypoints: KeypointCollection[];
  predefinedShapes: Shape[];
};

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
  isLoading: (status: boolean) => void;
  onSelectTool: (tool: string) => void;
  focusIntoView: (annotation: AnnotationTableItem) => void;
};

export type AnnotationTableRowProps = {
  annotation: AnnotationTableItem;
  onSelect: (id: ReactText, state: boolean) => void;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApprove: (
    annotation: AnnotationTableItem,
    status: AnnotationStatus
  ) => void;
  iconComponent?: ReactElement;
  borderColor?: string;
  expandByDefault?: boolean;
};

export type AnnotationTableItem = Omit<VisibleAnnotation, 'id'> & {
  id: ReactText;
};

export type VisionOptionType<T> = OptionType<T> & {
  order?: string;
  color?: string;
};
export type KeypointCollection = {
  collectionName: string;
  keypoints?: Keypoint[];
  lastUpdated?: number;
  id?: number;
};
