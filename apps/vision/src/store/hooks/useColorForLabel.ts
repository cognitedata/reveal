import { useSelector } from 'react-redux';

import { CDFAnnotationTypeEnum } from '../../api/annotation/types';
import { getAnnotationColor } from '../../utils/colorUtils';
import { RootState } from '../rootReducer';

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
