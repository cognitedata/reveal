import {
  AnnotatorBaseRegion,
  AnnotatorRegionType,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { VisionReviewAnnotation } from 'src/modules/Review/types';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';

export const getDummyRegion = <
  RegionType extends { type: AnnotatorRegionType } & AnnotatorBaseRegion
>({
  reviewAnnotation,
  regionProps,
  id,
  tags,
  highlighted = false,
  editingLabels = false,
  visible = true,
  color = 'red',
  cls = '',
  locked = false,
}: {
  reviewAnnotation: VisionReviewAnnotation<
    VisionAnnotation<VisionAnnotationDataType>
  >;
  regionProps: Omit<RegionType, keyof AnnotatorBaseRegion>;
  id?: string | number;
  tags?: string[];
  highlighted?: boolean;
  editingLabels?: boolean;
  visible?: boolean;
  color?: string;
  cls?: string;
  locked?: boolean;
}) => {
  const {
    id: annotationId,
    annotationType,
    status,
  } = reviewAnnotation.annotation;

  const labelOrText = getAnnotationLabelOrText(reviewAnnotation.annotation);

  const baseProperties: AnnotatorBaseRegion = {
    id: id || annotationId,
    annotationType,
    status,
    annotationLabelOrText: labelOrText,
    annotationMeta: reviewAnnotation,
    tags,
    highlighted,
    editingLabels,
    visible,
    color,
    cls,
    locked,
  };
  return {
    ...baseProperties,
    ...regionProps,
  };
};
