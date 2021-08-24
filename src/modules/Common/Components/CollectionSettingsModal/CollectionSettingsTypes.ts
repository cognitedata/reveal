export type Keypoint = {
  caption: string;
  order: string;
  color: string;
  defaultPosition?: [number, number];
};

export type KeypointCollection = {
  collectionName: string;
  keypoints?: Keypoint[];
  lastUpdated?: number;
  id?: number;
};
export type Shape = {
  shapeName: string;
  color: string;
  lastUpdated?: number;
  id?: number;
};

export type AnnotationCollection = {
  predefinedKeypoints: KeypointCollection[];
  predefinedShapes: Shape[];
};
