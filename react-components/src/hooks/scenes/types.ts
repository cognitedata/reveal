import { type NodeDefinition, type SourceSelectorV3 } from '@cognite/sdk';
import {
  type EdgeItem,
  type NodeItem,
  type DmsUniqueIdentifier,
  type Space,
  type ExternalId
} from '../../data-providers/FdmSDK';
import {
  type AddCadResourceOptions,
  type AddImage360CollectionDatamodelsOptions,
  type AddPointCloudResourceOptions
} from '../../components';
import {
  type SceneQualitySettings,
  type GroundPlane,
  type Skybox
} from '../../components/SceneContainer/sceneTypes';
import { type UseQueryResult } from '@tanstack/react-query';

export const SCENE_QUERY_LIMIT = 100;
export const SCENE_RELATED_DATA_LIMIT = 10000;

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

export type SceneData = {
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
  modelOptions: Array<AddCadResourceOptions | AddPointCloudResourceOptions>;
  image360CollectionOptions: AddImage360CollectionDatamodelsOptions[];
  groundPlanes: GroundPlane[];
  skybox?: Skybox;
  qualitySettings?: SceneQualitySettings;
};

export type SceneModelsProperties = Transformation3d & {
  revisionId: number;
};

export type SceneConfigurationProperties = {
  name: string;
  skybox?: DmsUniqueIdentifier;
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
  cadBudget?: number;
  pointCloudBudget?: number;
  maxRenderResolution?: number;
  movingCameraResolutionFactor?: number;
  pointCloudPointSize?: number;
  pointCloudPointShape?: string;
  pointCloudColor?: string;
};

export type SkyboxProperties = {
  label: string;
  isSpherical: boolean;
  file: string;
};

export type GroundPlaneProperties = {
  file: string;
  label: string;
  wrapping: string;
  repeatU?: number;
  repeatV?: number;
};

export type Cdf3dRevisionProperties = Transformation3d & {
  revisionId: number;
  defaultVisible?: boolean;
};

export type Cdf3dImage360CollectionProperties = Transformation3d & {
  image360CollectionExternalId: string;
  image360CollectionSpace: string;
  defaultVisible?: boolean;
};

export const SCENE_SOURCE = {
  type: 'view',
  space: 'scene',
  externalId: 'SceneConfiguration',
  version: 'v1'
} as const;

export const TRANSFORMATION_SOURCE = {
  type: 'view',
  space: 'cdf_3d_schema',
  externalId: 'Transformation3d',
  version: 'v1'
} as const;

export const ENVIRONMENT_MAP_SOURCE = {
  type: 'view',
  space: 'scene',
  externalId: 'EnvironmentMap',
  version: 'v1'
} as const;

export const IMAGE_360_COLLECTION_SOURCE = {
  type: 'view',
  space: 'scene',
  externalId: 'Image360CollectionProperties',
  version: 'v1'
} as const;

export const REVISION_SOURCE = {
  type: 'view',
  space: 'scene',
  externalId: 'RevisionProperties',
  version: 'v1'
} as const;

export const GROUND_PLANE_SOURCE = {
  type: 'view',
  space: 'scene',
  externalId: 'TexturedPlane',
  version: 'v1'
} as const;

export const groundPlaneSourceWithProperties: [
  {
    readonly source: {
      readonly type: 'view';
      readonly space: 'scene';
      readonly externalId: 'TexturedPlane';
      readonly version: 'v1';
    };
    readonly properties: ['file', 'label', 'wrapping', 'repeatU', 'repeatV'];
  }
] = [
  {
    source: GROUND_PLANE_SOURCE,
    properties: ['file', 'label', 'wrapping', 'repeatU', 'repeatV']
  }
] as const satisfies SourceSelectorV3;

export const transformationSourceWithProperties: [
  {
    readonly source: {
      readonly type: 'view';
      readonly space: 'cdf_3d_schema';
      readonly externalId: 'Transformation3d';
      readonly version: 'v1';
    };
    readonly properties: [
      'translationX',
      'translationY',
      'translationZ',
      'eulerRotationX',
      'eulerRotationY',
      'eulerRotationZ',
      'scaleX',
      'scaleY',
      'scaleZ'
    ];
  }
] = [
  {
    source: TRANSFORMATION_SOURCE,
    properties: [
      'translationX',
      'translationY',
      'translationZ',
      'eulerRotationX',
      'eulerRotationY',
      'eulerRotationZ',
      'scaleX',
      'scaleY',
      'scaleZ'
    ]
  }
] as const satisfies SourceSelectorV3;

export const sceneSourceWithProperties: [
  {
    readonly source: {
      readonly type: 'view';
      readonly space: 'scene';
      readonly externalId: 'SceneConfiguration';
      readonly version: 'v1';
    };
    readonly properties: ['*'];
  }
] = [
  {
    source: SCENE_SOURCE,
    properties: ['*']
  }
] as const satisfies SourceSelectorV3;

export const revisionSourceWithProperties: [
  {
    readonly source: {
      readonly type: 'view';
      readonly space: 'scene';
      readonly externalId: 'RevisionProperties';
      readonly version: 'v1';
    };
    readonly properties: ['*'];
  }
] = [
  {
    source: REVISION_SOURCE,
    properties: ['*']
  }
] as const satisfies SourceSelectorV3;

export const image360CollectionSourceWithProperties: [
  {
    readonly source: {
      readonly type: 'view';
      readonly space: 'scene';
      readonly externalId: 'Image360CollectionProperties';
      readonly version: 'v1';
    };
    readonly properties: ['*'];
  }
] = [
  {
    source: IMAGE_360_COLLECTION_SOURCE,
    properties: ['*']
  }
] as const satisfies SourceSelectorV3;

export const environmentMapSourceWithProperties: [
  {
    readonly source: {
      readonly type: 'view';
      readonly space: 'scene';
      readonly externalId: 'EnvironmentMap';
      readonly version: 'v1';
    };
    readonly properties: ['label', 'file', 'isSpherical'];
  }
] = [
  {
    source: ENVIRONMENT_MAP_SOURCE,
    properties: ['label', 'file', 'isSpherical']
  }
] as const satisfies SourceSelectorV3;

export type Use3dScenesResult = UseQueryResult<Record<Space, Record<ExternalId, SceneData>>>;

export type ScenesMap = Record<Space, Record<ExternalId, SceneData>>;

type SceneConfigurationPropertiesOptional = Partial<SceneConfigurationProperties>;

export type SceneNode = Omit<NodeDefinition, 'properties'> & {
  properties: {
    scene: {
      'SceneConfiguration/v1': SceneConfigurationPropertiesOptional;
    };
  };
};

export type Use3dScenesQueryResult = {
  scenes: SceneNode[];
  sceneModels: Array<EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>>>;
  scene360Collections: Array<
    EdgeItem<Record<string, Record<string, Cdf3dImage360CollectionProperties>>>
  >;
  sceneGroundPlanes: Array<NodeItem<GroundPlaneProperties>>;
  sceneGroundPlaneEdges: Array<EdgeItem<Record<string, Record<string, Transformation3d>>>>;
  sceneSkybox: Array<NodeItem<SkyboxProperties>>;
};
