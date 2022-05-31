import { FileInfo } from '@cognite/sdk';
import { OptionType } from '@cognite/cogs.js';
import { ReactText } from 'react';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import { VisibleAnnotation } from 'src/modules/Review/store/reviewSlice';
import {
  AnnotationStatus,
  KeypointItem,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { VisionReviewAnnotation } from 'src/modules/Review/store/review/types';

/** @deprecated */
export type LegacyKeypointItemCollection = {
  id: string;
  keypoints: KeypointItem[];
  name: string;
  show: boolean;
  status: AnnotationStatus;
  selected: boolean;
};

export type PredefinedShape = {
  shapeName: string;
  color: string;
  lastUpdated?: number;
  id?: number;
};
export type PredefinedKeypoint = {
  caption: string; // ToDo: update to label
  order: string;
  color: string;
  defaultPosition?: [number, number];
};

export type PredefinedKeypointCollection = {
  collectionName: string; // ToDo: change this to label
  keypoints?: PredefinedKeypoint[];
  lastUpdated?: number;
  id?: ReactText;
};

export type PredefinedVisionAnnotations = {
  predefinedKeypointCollections: PredefinedKeypointCollection[];
  predefinedShapes: PredefinedShape[];
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
  predefinedAnnotations: PredefinedVisionAnnotations;
  lastShapeName: string;
  lastKeypointCollection: PredefinedKeypointCollection;
  selectedTool: Tool;
  nextToDoKeypointInCurrentCollection: PredefinedKeypoint | null;
  currentKeypointCollection: LegacyKeypointItemCollection | null;
  isLoading: (status: boolean) => void;
  onSelectTool: (tool: Tool) => void;
  focusIntoView: (annotation: AnnotationTableItem) => void;
  openAnnotationSettings: (type: string, text?: string, color?: string) => void;
};

export type AnnotationTableRowProps = {
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>; // TODO: rename to reviewAnnotation
  onSelect: (id: ReactText, state: boolean) => void;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApprove: (id: ReactText, status: AnnotationStatus) => void;
  showColorCircle?: boolean;
  expandByDefault?: boolean;
};

/** @deprecated */
export type AnnotationTableItem = Omit<VisibleAnnotation, 'id'> & {
  id: ReactText;
  remainingKeypoints?: KeypointItem[];
};

export type VisionOptionType<T> = OptionType<T> & {
  order?: string;
  color?: string;
  icon?: string;
};

export type Tool = typeof tools[keyof typeof tools];

/**
 * @deprecated Its usage can likely be replaced by checking the type of `VisionAnnotationDataType`
 */
export enum Categories {
  Asset = 'Asset tags',
  Object = 'Objects',
  Text = 'Text',
  KeypointCollections = 'Keypoint collections',
  Classifications = 'Classification tags',
}
