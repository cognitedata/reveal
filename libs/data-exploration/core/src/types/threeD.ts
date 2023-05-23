export enum FileTypes {
  CAD_MOLDELS = 'CADModels',
  POINT_CLOUDS = 'PointClouds',
  IMAGES_360 = 'Images360',
}

export type FileTypeVisibility = {
  [key in FileTypes]: boolean;
};
