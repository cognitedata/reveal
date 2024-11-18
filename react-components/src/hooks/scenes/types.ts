/*!
 * Copyright 2024 Cognite AS
 */
import { type SourceSelectorV3 } from '@cognite/sdk/dist/src';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import {
  type AddCadResourceOptions,
  type AddImage360CollectionDatamodelsOptions,
  type AddPointCloudResourceOptions
} from '../../components';
import { type GroundPlane, type Skybox } from '../../components/SceneContainer/sceneTypes';

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
  cadModelOptions: Array<AddCadResourceOptions | AddPointCloudResourceOptions>;
  image360CollectionOptions: AddImage360CollectionDatamodelsOptions[];
  groundPlanes: GroundPlane[];
  skybox?: Skybox;
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
};

export type Cdf3dImage360CollectionProperties = Transformation3d & {
  image360CollectionExternalId: string;
  image360CollectionSpace: string;
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

export const groundPlaneSourceWithProperties = [
  {
    source: GROUND_PLANE_SOURCE,
    properties: ['file', 'label', 'wrapping', 'repeatU', 'repeatV']
  }
] as const satisfies SourceSelectorV3;

export const transformationSourceWithProperties = [
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

export const sceneSourceWithProperties = [
  {
    source: SCENE_SOURCE,
    properties: [
      'name',
      'skybox',
      'cameraTranslationX',
      'cameraTranslationY',
      'cameraTranslationZ',
      'cameraEulerRotationX',
      'cameraEulerRotationY',
      'cameraEulerRotationZ',
      'cameraTargetX',
      'cameraTargetY',
      'cameraTargetZ',
      'updatedAt'
    ]
  }
] as const satisfies SourceSelectorV3;

export const revisionSourceWithProperties = [
  {
    source: REVISION_SOURCE,
    properties: ['revisionId', ...transformationSourceWithProperties[0].properties]
  }
] as const satisfies SourceSelectorV3;

export const image360CollectionSourceWithProperties = [
  {
    source: IMAGE_360_COLLECTION_SOURCE,
    properties: [
      'image360CollectionExternalId',
      'image360CollectionSpace',
      ...transformationSourceWithProperties[0].properties
    ]
  }
] as const satisfies SourceSelectorV3;

export const environmentMapSourceWithProperties = [
  {
    source: ENVIRONMENT_MAP_SOURCE,
    properties: ['label', 'file', 'isSpherical']
  }
] as const satisfies SourceSelectorV3;
