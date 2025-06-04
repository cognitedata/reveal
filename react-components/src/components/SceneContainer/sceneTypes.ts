import { type Transformation3d } from './SceneFdmTypes';

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
};

export type ClassicModelIdentifier = {
  modelId: number;
  revisionId: number;
};

export type DMModelIdenfitier = {
  revisionExternalId: string;
  revisionSpace: string;
};

export type ModelIdentifier = ClassicModelIdentifier | DMModelIdenfitier;

export type CadOrPointCloudModel = Transformation3d & {
  modelIdentifier: ModelIdentifier;
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
  repeatU: number;
  repeatV: number;
};

export type SceneIdentifiers = {
  externalId: string;
  spaceId: string;
};
