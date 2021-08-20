export type Keypoint = {
  caption: string;
  order: string;
  color: string;
  defaultPosition?: [number, number];
};

export type KeypointCollection = {
  collectionName: string;
  keypoints?: Keypoint[];
};
export type Shape = {
  shapeName: string;
  color: string;
};

export type AnnotationCollection = {
  predefinedKeypoints: KeypointCollection[];
  predefinedShapes: Shape[];
};
