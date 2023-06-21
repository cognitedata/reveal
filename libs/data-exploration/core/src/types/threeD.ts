export enum FileTypes {
  MODELS_3D = 'Models3D',
  IMAGES_360 = 'Images360',
}

export type FileTypeVisibility = {
  [key in FileTypes]: boolean;
};
