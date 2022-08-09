import { Point, Status } from 'src/api/annotation/types';
import {
  KeypointCollectionState,
  KeypointState,
} from 'src/modules/Review/store/annotatorWrapper/type';
import {
  PredefinedKeypoint,
  PredefinedKeypointCollection,
  ReviewKeypoint,
  TempKeypointCollection,
} from 'src/modules/Review/types';
import { getDummyImageKeypointCollectionAnnotation } from './getDummyAnnotations';

export const getDummyKeypoint = (confidence?: number, point?: Point) => {
  return {
    confidence: confidence || 1,
    point: point || { x: 0.5, y: 0.5 },
  };
};

export const getDummyKeypointState = (
  label: string,
  confidence?: number,
  point?: Point
): KeypointState => {
  return {
    label,
    ...getDummyKeypoint(confidence, point),
  };
};

export const getDummyKeypointCollectionState = ({
  id,
  keypointIds,
  show = true,
  status = Status.Approved,
  label = getDummyPredefinedKeypointCollection(id).collectionName,
}: {
  id: number;
  keypointIds: string[];
  show?: boolean;
  status?: Status;
  label?: string;
}): KeypointCollectionState => {
  return {
    id,
    keypointIds,
    label,
    show,
    status,
  };
};

export const getDummyPredefinedKeypoint = (
  caption?: string
): PredefinedKeypoint => {
  return {
    caption: caption || 'center',
    order: '1',
    color: 'red',
  };
};
export const getDummyPredefinedKeypointCollection = (
  id: number
): PredefinedKeypointCollection => {
  return {
    id,
    collectionName: 'gauge',
    color: 'red',
    keypoints: [
      getDummyPredefinedKeypoint('left'),
      getDummyPredefinedKeypoint('center'),
      getDummyPredefinedKeypoint('right'),
    ],
  };
};

export const getDummyReviewImageKeypointObject = (
  id: number,
  selected = false
): ReviewKeypoint => {
  return {
    id: id.toString(),
    selected,
    keypoint: getDummyImageKeypointCollectionAnnotation({ id }).keypoints.start,
    label: 'start',
  };
};

export const getDummyTempKeypointCollection = ({
  id = 0,
  label = 'pump',
  annotatedResourceId = 1,
  reviewKeypoints = [
    {
      id: 'pump-one',
      selected: false,
      keypoint: { confidence: 0.5, point: { x: 0, y: 0 } },
      label: 'one',
    },
    {
      id: 'pump-two',
      selected: false,
      keypoint: { confidence: 0.5, point: { x: 1, y: 1 } },
      label: 'two',
    },
  ],
  remainingKeypoints = [
    {
      caption: 'three',
      color: 'yellow',
      order: '3',
      defaultPosition: [0.5, 0.5],
    },
  ],
}: {
  id?: number;
  label?: string;
  annotatedResourceId?: number;
  reviewKeypoints?: ReviewKeypoint[];
  remainingKeypoints?: PredefinedKeypoint[];
}): TempKeypointCollection => {
  return {
    id,
    annotatedResourceId,
    data: {
      label,
      keypoints: Object.fromEntries(
        reviewKeypoints.map((kp) => [kp.label, kp])
      ),
    },
    remainingKeypoints,
    color: 'red',
  };
};
