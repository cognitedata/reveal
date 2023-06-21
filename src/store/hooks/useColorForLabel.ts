import { useSelector } from 'react-redux';
import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';
import { RootState } from 'src/store/rootReducer';
import { getAnnotationColor } from 'src/utils/colorUtils';

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
