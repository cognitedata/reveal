import { v4 as uuid } from 'uuid';
import { AnnotationBoundingBox, Detection, DetectionType } from 'scarlet/types';

export const transformScannerDetection = (data: any): Detection => ({
  id: uuid(),
  key: data.value_type,
  type: DetectionType.SCANNER,
  ...(data.value_annotation && {
    boundingBox: getBoundingBox(data.value_annotation.bounding_box),
    pageNumber: data.value_annotation.page,
    value: data.value_annotation.text,
  }),
});

const getBoundingBox = (data?: any): AnnotationBoundingBox | undefined =>
  data && {
    x: data.x_min,
    y: data.y_min,
    width: data.x_max - data.x_min,
    height: data.y_max - data.y_min,
  };
