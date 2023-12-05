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

export type SceneResponse = {
  items: {
    scene: SceneConfigurationResponse[];
    skybox: SkyboxResponse[];
    groundPlanes: GroundPlaneResponse[];
    groundPlaneEdges: GroundPlaneEdgeResponse[];
    sceneModels: SceneModelsResponse[];
  };
  nextCursor: {
    scene: string;
    skybox: string;
  };
};

export type SceneConfigurationResponse = NodeResponse & {
  properties: Record<string, Record<string, SceneConfigurationProperties>>;
};

// export type ModelPropertiesResponse = EdgeResponse & {
//   properties: Record<string, Record<string, SceneConfigurationProperties>>;
// };

export type SkyboxResponse = NodeResponse & {
  properties: Record<string, Record<string, SkyboxProperties>>;
};

export type SceneModelsResponse = EdgeResponse & {
  properties: Record<string, Record<string, Cdf3dRevisionProperties>>;
};

export type SceneModelsProperties = Transformation3d & {
  revisionId: number;
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
};

export type GroundPlaneEdgeResponse = EdgeResponse & {
  properties: Record<string, Record<string, Transformation3d>>;
};

export type Cdf3dRevisionProperties = {
  revisionId: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  translationX: number;
  translationY: number;
  translationZ: number;
  eulerRotationX: number;
  eulerRotationY: number;
  eulerRotationZ: number;
};
