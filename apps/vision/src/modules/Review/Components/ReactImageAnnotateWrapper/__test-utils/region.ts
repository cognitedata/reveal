import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '@vision/modules/Common/types';
import { getAnnotationLabelOrText } from '@vision/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  AnnotatorBaseRegion,
  AnnotatorNewRegion,
  AnnotatorRegionType,
} from '@vision/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { VisionReviewAnnotation } from '@vision/modules/Review/types';

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
    tags: tags || [],
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

export const getDummyRegionOriginatedInAnnotator = ({
  id,
  annotationLabelOrText,
  editingLabels = true,
  highlighted = true,
  color = 'red',
  ...rest
}: AnnotatorNewRegion) => {
  let regionProps = rest;
  if (!regionProps) {
    regionProps = {
      type: AnnotatorRegionType.BoxRegion,
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    };
  }
  return {
    id,
    annotationLabelOrText,
    editingLabels,
    highlighted,
    color,
    ...regionProps,
  };
};
