export type AnnotationBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Annotation = {
  boundingBox: AnnotationBoundingBox;
  documentExternalId?: string;
  pageNumber: number;
};
