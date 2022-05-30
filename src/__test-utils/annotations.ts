import {
  AnnotationStatus,
  AnnotationUtilsV1,
  ModelTypeAnnotationTypeMap,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  RegionType,
  Vertex,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import {
  AnnotationMetadataV1,
  AnnotationTypeV1,
  Keypoint,
  Point,
  Status,
} from 'src/api/annotation/types';
import { KeypointCollectionState } from 'src/modules/Review/store/annotatorWrapper/type';
import { LegacyKeypoint, KeypointCollection } from 'src/modules/Review/types';
import { ReviewKeypoint } from 'src/modules/Review/store/review/types';
import { getDummyImageKeypointCollectionAnnotation } from './getDummyAnnotations';

export const getDummyAnnotation = (
  id?: number,
  modelType?: number,
  other?: {
    status?: AnnotationStatus;
    confidence?: number;
    text?: string;
    assetId?: number;
    shape?: RegionType;
    vertices?: Vertex[];
    data?: AnnotationMetadataV1;
    type?: AnnotationTypeV1;
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
    other?.status || AnnotationStatus.Unhandled,
    { ...other?.data, confidence: other?.confidence },
    other?.type ||
      ModelTypeAnnotationTypeMap[modelType || VisionDetectionModelType.OCR],
    undefined,
    other?.assetId
  );
};

export const getDummyKeypointState = (
  label: string,
  confidence?: number,
  point?: Point
): Keypoint => {
  return {
    label,
    confidence: confidence || 1,
    point: point || { x: 0.5, y: 0.5 },
  };
};

export const getDummyKeypointCollectionState = (
  id: string,
  keypointIds: string[]
): KeypointCollectionState => {
  return {
    id,
    keypointIds,
    label: getDummyPredefinedKeypoint(id).collectionName,
    show: true,
    status: Status.Approved,
  };
};

export const dummyKeypoint = (caption?: string): LegacyKeypoint => {
  return {
    caption: caption || 'center',
    order: '1',
    color: 'red',
  };
};
export const getDummyPredefinedKeypoint = (id: string): KeypointCollection => {
  return {
    id,
    collectionName: 'gauge',
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
    keypoint: getDummyImageKeypointCollectionAnnotation({ id }).keypoints[0],
  };
};
