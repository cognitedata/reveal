import { useSelector } from 'react-redux';

import { CDFAnnotationTypeEnum } from '@vision/api/annotation/types';
import { RootState } from '@vision/store/rootReducer';
import { getAnnotationColor } from '@vision/utils/colorUtils';

const useColorForLabel = (
  text: string,
  annotationType?: CDFAnnotationTypeEnum
): string => {
  const annotationColorMap = useSelector(
    ({ annotationReducer }: RootState) => annotationReducer.annotationColorMap
  );
  return getAnnotationColor(annotationColorMap, text, annotationType);
};

export default useColorForLabel;
