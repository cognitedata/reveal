import { type UseQueryResult } from '@tanstack/react-query';
import {
  type Cdf3dImage360CollectionProperties,
  type Cdf3dRevisionProperties,
  type GroundPlaneProperties,
  type SceneConfigurationProperties,
  type SkyboxProperties,
  type Transformation3d,
  type SceneData
} from './types';
import { type NodeDefinition } from '@cognite/sdk';
import { type NodeItem } from '../../data-providers';
import { type EdgeItem } from '../../data-providers/FdmSDK';

export type Space = string;
export type ExternalId = string;

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
