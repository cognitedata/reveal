import { VisionAnnotation } from 'src/modules/Common/types';
import { ImageKeypoint, Label } from 'src/api/annotation/types';

// primitives

export type Visible = {
  show: boolean;
};

export type Selectable = {
  selected: boolean;
};

export type KeypointId = { id: string };

// derivations

// Casts ImageKeypoint to ReviewKeypoint[] if Type is ImageKeypoint[]
type TurnKeypointType<Type> = {
  [Property in keyof Type]: Type[Property] extends ImageKeypoint[]
    ? ReviewKeypoint[]
    : Type[Property];
};

export type ReviewAnnotation<Type> = Visible &
  Selectable & {
    annotation: TurnKeypointType<VisionAnnotation<Type>>;
  };

export type ReviewKeypoint = KeypointId &
  Selectable & {
    keypoint: ImageKeypoint;
  };

// type for temp keypoint collection
export type UnsavedKeypointCollection = Label &
  Visible &
  Selectable & {
    keypoints: ReviewKeypoint[];
  };
