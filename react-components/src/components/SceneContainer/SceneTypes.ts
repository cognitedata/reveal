/*!
 * Copyright 2023 Cognite AS
 */
export type Scene = {
  sceneConfiguration: SceneConfiguration;
  skybox: Skybox | undefined;
  groundPlanes: GroundPlane[];
  sceneModels: CadOrPointCloudModel[];
  image360Collections: Image360Collection[];
};

export type Transformation3d = {
  translationX: number;
  translationY: number;
  translationZ: number;
  eulerRotationX: number;
  eulerRotationY: number;
  eulerRotationZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
};

export type SceneConfiguration = {
  name: string;
  cameraTranslationX: number;
  cameraTranslationY: number;
  cameraTranslationZ: number;
  cameraEulerRotationX: number;
  cameraEulerRotationY: number;
  cameraEulerRotationZ: number;
};

export type CadOrPointCloudModel = Transformation3d & {
  modelId: number;
  revisionId: number;
};

export type Image360Collection = Transformation3d & {
  image360CollectionExternalId: string;
  image360CollectionSpace: string;
};

export type Skybox = {
  label: string;
  isSpherical: boolean;
  file: string;
};

export type GroundPlane = Transformation3d & {
  file: string;
  label: string;
  wrapping: string;
};
