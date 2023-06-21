import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { CDFAnnotationTypeEnum, Status } from 'src/api/annotation/types';
import { VisionReviewAnnotation } from 'src/modules/Review/types';

// This will always be a label or a text field of an annotation
export type AnnotatorAnnotationLabelOrText = string;

/** @deprecated  do not use this property within library this should be used for annotation-region mapping only
 */
export type AnnotationMeta = VisionReviewAnnotation<VisionAnnotationDataType>;

export enum AnnotatorRegionType {
  PointRegion = 'point',
  PolygonRegion = 'polygon',
  BoxRegion = 'box',
  LineRegion = 'line',
}

export type AnnotatorBaseRegion = {
  id: number | string;
  color: string;
  /** @deprecated library specific property - should not be utilized anywhere but conversion functions */
  annotationMeta: AnnotationMeta;
  status: Status;
  annotationType: CDFAnnotationTypeEnum;
  annotationLabelOrText: AnnotatorAnnotationLabelOrText;
  tags?: Array<string>;
  editingLabels?: boolean;
  highlighted?: boolean;
  cls?: string;
  locked?: boolean;
  visible?: boolean;
};

export type AnnotatorBoxRegion = AnnotatorBaseRegion & {
  type: AnnotatorRegionType.BoxRegion;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type AnnotatorPointRegion = AnnotatorBaseRegion & {
  type: AnnotatorRegionType.PointRegion;
  x: number;
  y: number;
  parentAnnotationId: number;
  keypointLabel: string;
  keypointConfidence: number | undefined;
};

export type AnnotatorPolygonRegion = AnnotatorBaseRegion & {
  type: AnnotatorRegionType.PolygonRegion;
  open?: boolean;
  points: Array<[number, number]>;
};

export type AnnotatorLineRegion = AnnotatorBaseRegion & {
  type: AnnotatorRegionType.LineRegion;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type AnnotatorRegion =
  | AnnotatorBoxRegion
  | AnnotatorPointRegion
  | AnnotatorPolygonRegion
  | AnnotatorLineRegion;

export type AnnotatorRegionLabelProps = {
  region: AnnotatorRegion;
  editing: boolean;
  onDelete: (region: AnnotatorRegion) => void;
  onClose: (region: AnnotatorRegion) => void;
  onChange: (region: AnnotatorRegion) => void;
};

// todo: rework the type to make id of type number
export type AnnotatorNewRegion = Pick<
  AnnotatorRegion,
  'id' | 'annotationLabelOrText' | 'highlighted' | 'editingLabels' | 'color'
> &
  (
    | Omit<AnnotatorBoxRegion, keyof AnnotatorBaseRegion>
    | Omit<AnnotatorLineRegion, keyof AnnotatorBaseRegion>
    | Omit<AnnotatorPolygonRegion, keyof AnnotatorBaseRegion>
    | Omit<AnnotatorPointRegion, keyof AnnotatorBaseRegion>
  );

export function isAnnotatorBoxRegion(
  region: AnnotatorRegion
): region is AnnotatorBoxRegion {
  return region.type === AnnotatorRegionType.BoxRegion;
}

export function isAnnotatorPolygonRegion(
  region: AnnotatorRegion
): region is AnnotatorPolygonRegion {
  return region.type === AnnotatorRegionType.PolygonRegion;
}

export function isAnnotatorPointRegion(
  region: AnnotatorRegion | AnnotatorNewRegion
): region is AnnotatorPointRegion {
  return region.type === AnnotatorRegionType.PointRegion;
}

export function isAnnotatorLineRegion(
  region: AnnotatorRegion
): region is AnnotatorLineRegion {
  return region.type === AnnotatorRegionType.LineRegion;
}
