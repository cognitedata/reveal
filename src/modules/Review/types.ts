import { OptionType } from '@cognite/cogs.js';
import { ReactText } from 'react';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import {
  AnnotationStatus,
  KeypointItem,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  ImageKeypointCollection,
  Keypoint,
  Status,
} from 'src/api/annotation/types';

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
  color: string;
};

export type PredefinedVisionAnnotations = {
  predefinedKeypointCollections: PredefinedKeypointCollection[];
  predefinedShapes: PredefinedShape[];
};

export type AnnotationTableRowProps = {
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>;
  onSelect: (id: ReactText, state: boolean) => void;
  onDelete: (id: number) => void;
  onVisibilityChange: (id: number) => void;
  onApprove: (id: number, status: Status) => void;
  showColorCircle?: boolean;
  expandByDefault?: boolean;
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

/**
 * New Vision Review Types
 */

// primitives

export type Visible = {
  show: boolean;
};
export type Selectable = {
  selected: boolean;
};
export type KeypointId = { id: string };

// derivations

// Casts Keypoint to ReviewKeypoint[] if Type is Keypoint[]
export type TurnKeypointType<Type> = {
  [Property in keyof Type]: Type[Property] extends Keypoint[]
    ? ReviewKeypoint[]
    : Type[Property];
};
export type VisionReviewAnnotation<Type> = Visible &
  Selectable & {
    annotation: TurnKeypointType<VisionAnnotation<Type>>;
  };

export type ReviewKeypoint = KeypointId &
  Selectable & {
    keypoint: Keypoint;
  };

/**
 * Used for storing intermediate data **during** creation of keypoint collections.
 * After the creation process, the data is converted into `UnsavedVisionAnnotation<ImageKeypointCollection>`
 * before written to CDF. Once this is done, the created collection will become available as other existing collections
 * as `VisionReviewAnnotation<ImageKeypointCollection>`
 */
export type TempKeypointCollection = Pick<
  UnsavedVisionAnnotation<ImageKeypointCollection>,
  'annotatedResourceId'
> & { id: number; data: TurnKeypointType<ImageKeypointCollection> } & {
  remainingKeypoints: PredefinedKeypoint[];
};
