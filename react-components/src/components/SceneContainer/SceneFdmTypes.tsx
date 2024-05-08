/*!
 * Copyright 2023 Cognite AS
 */
export type NodeResponse = {
  instanceType: string;
  version: number;
  space: string;
  externalId: string;
};

export type EdgeResponse = {
  version: number;
  type: {
    space: string;
    externalId: string;
  };
  space: string;
  externalId: string;
  startNode: {
    space: string;
    externalId: string;
  };
  endNode: {
    space: string;
    externalId: string;
  };
};

export type SceneResponse = {
  items: {
    myScene: SceneConfigurationResponse[];
    skybox: SkyboxResponse[];
    groundPlanes: GroundPlaneResponse[];
    groundPlaneEdges: GroundPlaneEdgeResponse[];
    sceneModels: SceneModelsResponse[];
    image360CollectionsEdges: Image360CollectionsResponse[];
  };
  nextCursor: {
    scene: string;
    skybox: string;
  };
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

export type SceneConfigurationResponse = NodeResponse & {
  properties: Record<string, Record<string, SceneConfigurationProperties>>;
};

export type SkyboxResponse = NodeResponse & {
  properties: Record<string, Record<string, SkyboxProperties>>;
};

export type SceneModelsResponse = EdgeResponse & {
  properties: Record<string, Record<string, SceneModelsProperties>>;
};

export type SceneModelsProperties = Transformation3d & {
  revisionId: number;
};

export type Image360CollectionsResponse = EdgeResponse & {
  properties: Record<string, Record<string, Scene360ImageCollectionsProperties>>;
};

export type Scene360ImageCollectionsProperties = Transformation3d & {
  image360CollectionExternalId: string;
  image360CollectionSpace: string;
};

export type SceneConfigurationProperties = {
  name: string;
  cameraTranslationX: number;
  cameraTranslationY: number;
  cameraTranslationZ: number;
  cameraEulerRotationX: number;
  cameraEulerRotationY: number;
  cameraEulerRotationZ: number;
};

export type SkyboxProperties = {
  label: string;
  isSpherical: boolean;
  file: string;
};

export type GroundPlaneResponse = NodeResponse & {
  properties: Record<string, Record<string, GroundPlaneProperties>>;
};

export type GroundPlaneProperties = {
  file: string;
  label: string;
  wrapping: string;
  repeatU?: number;
  repeatV?: number;
};

export type GroundPlaneEdgeResponse = EdgeResponse & {
  properties: Record<string, Record<string, Transformation3d>>;
};
