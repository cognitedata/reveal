import { type Matrix4 } from 'three';

export type Scene = {
  sceneConfiguration: SceneConfiguration;
  skybox: Skybox | undefined;
  groundPlanes: GroundPlane[];
  sceneModels: CadOrPointCloudModel[];
  image360Collections: Image360Collection[];
};

export type SceneConfiguration = {
  name: string;
  cameraTranslationX: number;
  cameraTranslationY: number;
  cameraTranslationZ: number;
  cameraEulerRotationX: number;
  cameraEulerRotationY: number;
  cameraEulerRotationZ: number;
  cameraTargetX?: number;
  cameraTargetY?: number;
  cameraTargetZ?: number;
  updatedAt?: string;
  qualitySettings?: SceneQualitySettings;
};

export type SceneQualitySettings = {
  cadBudget?: number;
  pointCloudBudget?: number;
  maxRenderResolution?: number;
  movingCameraResolutionFactor?: number;
  pointCloudPointSize?: number;
  pointCloudPointShape?: string;
  pointCloudColor?: string;
};

export type ClassicModelIdentifier = {
  modelId: number;
  revisionId: number;
};

export type DMModelIdentifier = {
  revisionExternalId: string;
  revisionSpace: string;
};

export type ModelIdentifier = ClassicModelIdentifier | DMModelIdentifier;

export type CadOrPointCloudModel = {
  modelIdentifier: ModelIdentifier;
  defaultVisible?: boolean;
  transform?: Matrix4;
};

export type Image360Collection = {
  image360CollectionExternalId: string;
  image360CollectionSpace: string;
  defaultVisible?: boolean;
  transform?: Matrix4;
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
  repeatU: number;
  repeatV: number;
};

export type SceneIdentifiers = {
  externalId: string;
  spaceId: string;
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
