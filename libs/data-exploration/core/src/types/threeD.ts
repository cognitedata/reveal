export enum FileTypes {
  CAD_MODELS = 'CADModels',
  POINT_CLOUDS = 'PointClouds',
  IMAGES_360 = 'Images360',
}

export type FileTypeVisibility = {
  [key in FileTypes]: boolean;
};
