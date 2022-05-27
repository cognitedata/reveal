import { FileInfo } from '@cognite/sdk';
import { OptionType } from '@cognite/cogs.js';
import { ReactText } from 'react';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import { VisibleAnnotation } from 'src/modules/Review/store/reviewSlice';
import {
  AnnotationStatus,
  KeypointItem,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';

export type LegacyKeypointItemCollection = {
  id: string;
  keypoints: KeypointItem[];
  name: string;
  show: boolean;
  status: AnnotationStatus;
  selected: boolean;
};

export type LegacyKeypoint = {
  caption: string; // ToDo: update to label
  order: string;
  color: string;
  defaultPosition?: [number, number];
};
export type LegacyShape = {
  shapeName: string;
  color: string;
  lastUpdated?: number;
  id?: number;
};
export type LegacyAnnotationCollection = {
  predefinedKeypoints: KeypointCollection[];
  predefinedShapes: LegacyShape[];
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
  predefinedAnnotations: LegacyAnnotationCollection;
  lastShapeName: string;
  lastKeypointCollection: KeypointCollection;
  selectedTool: Tool;
  nextToDoKeypointInCurrentCollection: LegacyKeypoint | null;
  currentKeypointCollection: LegacyKeypointItemCollection | null;
  isLoading: (status: boolean) => void;
  onSelectTool: (tool: Tool) => void;
  focusIntoView: (annotation: AnnotationTableItem) => void;
  openAnnotationSettings: (type: string, text?: string, color?: string) => void;
};

export type AnnotationTableRowProps = {
  annotation: AnnotationTableItem;
  onSelect: (id: ReactText, state: boolean) => void;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApprove: (id: ReactText, status: AnnotationStatus) => void;
  showColorCircle?: boolean;
  expandByDefault?: boolean;
};

export type AnnotationTableItem = Omit<VisibleAnnotation, 'id'> & {
  id: ReactText;
  remainingKeypoints?: KeypointItem[];
};

export type VisionOptionType<T> = OptionType<T> & {
  order?: string;
  color?: string;
  icon?: string;
};
export type KeypointCollection = {
  collectionName: string; // ToDo: change this to label
  keypoints?: LegacyKeypoint[];
  lastUpdated?: number;
  id?: ReactText;
};

export type Tool = typeof tools[keyof typeof tools];

export enum Categories {
  Asset = 'Asset tags',
  Object = 'Objects',
  Text = 'Text',
  KeypointCollections = 'Keypoint collections',
  Classifications = 'Classification tags',
}
