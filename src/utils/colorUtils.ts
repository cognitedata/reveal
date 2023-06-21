import { LegacyAnnotation } from 'src/api/annotation/legacy/legacyTypes';
import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';
import {
  ColorsObjectDetection,
  ColorsOCR,
  ColorsPersonDetection,
  ColorsTagDetection,
} from 'src/constants/Colors';
import { getRandomColor } from 'src/modules/Review/Components/AnnotationSettingsModal/AnnotationSettingsUtils';
import { isSensitiveAnnotationLabel } from 'src/utils/textUtils';

export const getAnnotationColorFromColorKey = (
  annotationColorMap: Record<string, string>,
  colorKey: string
): string => {
  if (colorKey in annotationColorMap) {
    return annotationColorMap[colorKey];
  }
  if (isSensitiveAnnotationLabel(colorKey)) {
    return ColorsPersonDetection.color;
  }
  return ColorsObjectDetection.color;
};
export const getAnnotationColor = (
  annotationColorMap: Record<string, string>,
  colorKey: string,
  annotationType?: CDFAnnotationTypeEnum
): string => {
  if (annotationType === CDFAnnotationTypeEnum.ImagesAssetLink) {
    return ColorsTagDetection.color;
  }
  if (annotationType === CDFAnnotationTypeEnum.ImagesTextRegion) {
    return ColorsOCR.color;
  }
  return getAnnotationColorFromColorKey(annotationColorMap, colorKey);
};

/**
 * Selects color for predefined annotations
 *
 * If predefined annotation text is a sensitive label, it will be assigned ColorsPersonDetection.color
 * no matter it's color attribute
 *
 * For predefined annotations created before june 2022 color of the first keypoint will be the predefined color
 * of the annotation
 *
 * If no color attribute is present ColorsObjectDetection.color will be the default color
 * @param annotation
 */
export const getPredefinedAnnotationColor = (annotation: LegacyAnnotation) => {
  if (isSensitiveAnnotationLabel(annotation.text)) {
    return ColorsPersonDetection.color;
  }
  if (annotation.data?.color) {
    return annotation.data.color;
  }
  if (annotation.data?.keypoint && annotation.data?.keypoints?.length) {
    return annotation.data?.keypoints[0].color;
  }
  return getRandomColor();
};
