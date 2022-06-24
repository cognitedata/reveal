import { useSelector } from 'react-redux';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/index';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  isImageAssetLinkData,
  isImageExtractedTextData,
} from 'src/modules/Common/types/typeGuards';
import { ColorsTagDetection, ColorsOCR } from 'src/constants/Colors';
import { RootState } from 'src/store/rootReducer';

export const getAnnotationColorFromColorKey = (
  annotationColorMap: Record<string, string>,
  colorKey: string
): string => {
  if (colorKey in annotationColorMap) {
    return annotationColorMap[colorKey];
  }
  return '';
};

export const getAnnotationColor = (
  annotationColorMap: Record<string, string>,
  annotation: VisionAnnotation<VisionAnnotationDataType>
): string => {
  if (isImageAssetLinkData(annotation)) {
    return ColorsTagDetection.color;
  }
  if (isImageExtractedTextData(annotation)) {
    return ColorsOCR.color;
  }
  const colorKey = getAnnotationLabelOrText(annotation);
  return getAnnotationColorFromColorKey(annotationColorMap, colorKey);
};

const useAnnotationColor = (
  annotation: VisionAnnotation<VisionAnnotationDataType>
): string => {
  const annotationColorMap = useSelector(
    ({ annotationReducer }: RootState) => annotationReducer.annotationColorMap
  );
  return getAnnotationColor(annotationColorMap, annotation);
};

export default useAnnotationColor;
