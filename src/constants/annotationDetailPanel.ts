import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';
import {
  ColorsObjectDetection,
  ColorsOCR,
  ColorsTagDetection,
} from 'src/constants/Colors';
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
export const annotationRowComponent = {
  [CDFAnnotationTypeEnum.ImagesAssetLink]: ReviewAssetLinkAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: ReviewVisionAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesClassification]: ReviewVisionAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesTextRegion]: ReviewVisionAnnotationRow,
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: ReviewVisionAnnotationRow,
};

export const annotationTypeStyleMap = {
  [CDFAnnotationTypeEnum.ImagesAssetLink]: ColorsTagDetection,
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: ColorsObjectDetection,
  [CDFAnnotationTypeEnum.ImagesClassification]: ColorsObjectDetection,
  [CDFAnnotationTypeEnum.ImagesTextRegion]: ColorsOCR,
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: ColorsObjectDetection,
};

export const annotationTypeIconMap = {
  [CDFAnnotationTypeEnum.ImagesAssetLink]: 'Assets',
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: 'Scan',
  [CDFAnnotationTypeEnum.ImagesClassification]: 'Scan',
  [CDFAnnotationTypeEnum.ImagesTextRegion]: 'String',
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: 'Scan',
};
