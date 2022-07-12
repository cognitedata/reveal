import {
  AnnotationUtilsV1,
  ModelTypeAnnotationTypeMap,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  RegionType,
  Vertex,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import { Keypoint, Point, Status } from 'src/api/annotation/types';
import { KeypointCollectionState } from 'src/modules/Review/store/annotatorWrapper/type';
import {
  PredefinedKeypoint,
  PredefinedKeypointCollection,
  ReviewKeypoint,
  TempKeypointCollection,
} from 'src/modules/Review/types';
import {
  LegacyAnnotationMetadata,
  LegacyAnnotationStatus,
  LegacyAnnotationType,
} from 'src/api/annotation/legacyTypes';
import { getDummyImageKeypointCollectionAnnotation } from './getDummyAnnotations';

/**
 * @deprecated method of Annotation V1 api
 */
export const getDummyAnnotation = (
  id?: number,
  modelType?: number,
  other?: {
    status?: LegacyAnnotationStatus;
    confidence?: number;
    text?: string;
    assetId?: number;
    shape?: RegionType;
    vertices?: Vertex[];
    data?: LegacyAnnotationMetadata;
    type?: LegacyAnnotationType;
  }
) => {
  return AnnotationUtilsV1.createVisionAnnotationStubV1(
    id || 1,
    other?.text || 'pump',
    modelType || 1,
    1,
    123,
    124,
    { shape: other?.shape || 'rectangle', vertices: other?.vertices! },
    undefined,
    undefined,
    other?.status || LegacyAnnotationStatus.Unhandled,
    { ...other?.data, confidence: other?.confidence },
    other?.type ||
      ModelTypeAnnotationTypeMap[modelType || VisionDetectionModelType.OCR],
    undefined,
    other?.assetId
  );
};

export const getDummyKeypointState = (
  confidence?: number,
  point?: Point
): Keypoint => {
  return {
    confidence: confidence || 1,
    point: point || { x: 0.5, y: 0.5 },
  };
};

export const getDummyKeypointCollectionState = (
  id: number,
  keypointIds: string[]
): KeypointCollectionState => {
  return {
    id,
    keypointIds,
    label: getDummyPredefinedKeypointCollection(id).collectionName,
    show: true,
    status: Status.Approved,
  };
};

export const dummyKeypoint = (caption?: string): PredefinedKeypoint => {
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
      dummyKeypoint('left'),
      dummyKeypoint('center'),
      dummyKeypoint('right'),
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
