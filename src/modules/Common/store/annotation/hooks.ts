import { useSelector } from 'react-redux';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/index';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  isImageAssetLinkData,
  isImageExtractedTextData,
  isImageObjectDetectionData,
} from 'src/modules/Common/types/typeGuards';
import {
  ColorsTagDetection,
  ColorsOCR,
  ColorsPersonDetection,
} from 'src/constants/Colors';
import { RootState } from 'src/store/rootReducer';

const useAnnotationColor = (
  annotation: VisionAnnotation<VisionAnnotationDataType>
): string => {
  const state = useSelector(
    ({ annotationReducer }: RootState) => annotationReducer
  );
  if (isImageAssetLinkData(annotation)) {
    return ColorsTagDetection.color;
  }
  if (isImageExtractedTextData(annotation)) {
    return ColorsOCR.color;
  }

  if (isImageObjectDetectionData(annotation)) {
    return ColorsPersonDetection.color;
  }

  const colorKey = getAnnotationLabelOrText(annotation);
  if (colorKey in state.annotationColorMap) {
    return state.annotationColorMap[colorKey];
  }
  return '';
};

export default useAnnotationColor;
