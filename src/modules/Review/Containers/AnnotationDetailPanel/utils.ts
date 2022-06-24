import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import {
  ReviewAssetLinkAnnotationRow,
  ReviewVisionAnnotationRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components';

export const annotationCategoryTitle = {
  [CDFAnnotationTypeEnum.ImagesAssetLink]: 'Asset tags',
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: 'Objects',
  [CDFAnnotationTypeEnum.ImagesClassification]: 'Classification tags',
  [CDFAnnotationTypeEnum.ImagesTextRegion]: 'Text',
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: 'Keypoint collections',
};

export const annotationTypeFromCategoryTitle = Object.fromEntries(
  Object.entries(annotationCategoryTitle).map(([k, v]) => [v, k])
);

export const annotationObjectsName = {
  [CDFAnnotationTypeEnum.ImagesAssetLink]: 'assets',
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: 'objects',
  [CDFAnnotationTypeEnum.ImagesClassification]: 'classifications',
  [CDFAnnotationTypeEnum.ImagesTextRegion]: 'text or objects',
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: 'keypoints',
};

export const annotationDetectionModelType = {
  [CDFAnnotationTypeEnum.ImagesAssetLink]:
    VisionDetectionModelType.TagDetection,
  [CDFAnnotationTypeEnum.ImagesObjectDetection]:
    VisionDetectionModelType.ObjectDetection,
  // NOTE: Classication annotations are currently treated as object detections
  [CDFAnnotationTypeEnum.ImagesClassification]:
    VisionDetectionModelType.ObjectDetection,
  [CDFAnnotationTypeEnum.ImagesTextRegion]: VisionDetectionModelType.OCR,
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]:
    VisionDetectionModelType.ObjectDetection,
};

export const annotationRowComponent = {
  [CDFAnnotationTypeEnum.ImagesAssetLink]: ReviewAssetLinkAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: ReviewVisionAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesClassification]: ReviewVisionAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesTextRegion]: ReviewVisionAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: ReviewVisionAnnotationRow,
};
