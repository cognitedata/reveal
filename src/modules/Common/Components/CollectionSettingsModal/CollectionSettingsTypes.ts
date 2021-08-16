export type Keypoint = {
  caption: string;
  order: string;
  color: string;
};

export type KeypointCollection = {
  collectionName: string;
  keypoints?: Keypoint[];
};
export type Shape = {
  ShapeName: string;
  color: string;
};

export type AnnotationCollection = {
  predefinedKeypoints: KeypointCollection[];
  predefinedShapes: Shape[]; // use proper type
};
