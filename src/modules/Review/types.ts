import { FileInfo } from '@cognite/sdk';
import { OptionType } from '@cognite/cogs.js';
import { ReactText } from 'react';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import { VisibleAnnotation } from 'src/modules/Review/store/reviewSlice';
import {
  AnnotationStatus,
  KeypointItem,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { VisionAnnotation } from 'src/modules/Common/types';
import { ImageKeypoint, Label, Status } from 'src/api/annotation/types';

// primitives

export type Visible = {
  show: boolean;
};

export type Selectable = {
  selected: boolean;
};

export type ReviewId = { id: string };

// derivations

export type Reviewable = Visible & Selectable;

type TurnKeypointType<Type> = {
  [Property in keyof Type]: Type[Property] extends ImageKeypoint[]
    ? ReviewKeypoint[]
    : Type[Property];
};

export type ReviewAnnotation<Type> = TurnKeypointType<VisionAnnotation<Type>> &
  Reviewable;

export type ReviewKeypoint = ImageKeypoint & ReviewId & Reviewable;

// type for temp keypoint collections
export type TempKeypointCollection = Label &
  ReviewId &
  Reviewable & {
    keypoints: ReviewKeypoint[];
    status: Status;
  };

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
  predefinedAnnotations: AnnotationCollection;
  lastShapeName: string;
  lastKeypointCollection: KeypointCollection;
  selectedTool: Tool;
  nextToDoKeypointInCurrentCollection: Keypoint | null;
  currentKeypointCollection: KeypointItemCollection | null;
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
  collectionName: string;
  keypoints?: Keypoint[];
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
