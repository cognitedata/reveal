import { VisionAnnotation } from 'src/modules/Common/types';
import { AnnotatedResourceId, Keypoint, Label } from 'src/api/annotation/types';

// primitives

type Visible = {
  show: boolean;
};

export type Selectable = {
  selected: boolean;
};

type KeypointId = { id: string };

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

// type for temp keypoint collection
export type UnsavedKeypointCollection = Label &
  Visible &
  AnnotatedResourceId &
  Selectable & {
    reviewKeypoints: ReviewKeypoint[];
  };
