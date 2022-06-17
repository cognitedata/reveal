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

const useAnnotationColor = (
  annotation: VisionAnnotation<VisionAnnotationDataType>
): string => {
  const annotationColorMap = useSelector(
    ({ annotationReducer }: RootState) => annotationReducer.annotationColorMap
  );
  if (isImageAssetLinkData(annotation)) {
    return ColorsTagDetection.color;
  }
  if (isImageExtractedTextData(annotation)) {
    return ColorsOCR.color;
  }
  const colorKey = getAnnotationLabelOrText(annotation);
  if (colorKey in annotationColorMap) {
    return annotationColorMap[colorKey];
  }
  return '';
};

export default useAnnotationColor;
