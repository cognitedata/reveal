import { OptionType } from '@cognite/cogs.js';
import { ReactText } from 'react';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  ImageKeypointCollection,
  Keypoint,
  Label,
  Status,
} from 'src/api/annotation/types';

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
  showEditOptions: boolean;
  expandByDefault?: boolean;
};

export type VisionOptionType<T> = OptionType<T> & {
  color?: string;
  icon?: string;
};

export type Tool = typeof tools[keyof typeof tools];

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
export type Color = {
  color: string;
};
export type KeypointId = { id: string };

// derivations

// Casts Keypoint to Record<string, ReviewKeypoint> if Type is Record<string, Keypoint>
export type TurnKeypointType<Type> = {
  [Property in keyof Type]: Type[Property] extends Record<string, Keypoint>
    ? Record<string, ReviewKeypoint>
    : Type[Property];
};
export type VisionReviewAnnotation<Type> = Visible &
  Selectable &
  Color & {
    annotation: TurnKeypointType<VisionAnnotation<Type>>;
  };

export type ReviewKeypoint = KeypointId &
  Label &
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
> &
  Color & { id: number; data: TurnKeypointType<ImageKeypointCollection> } & {
    remainingKeypoints: PredefinedKeypoint[];
  };
