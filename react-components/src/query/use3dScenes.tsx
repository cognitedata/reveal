/*!
 * Copyright 2023 Cognite AS
 */

import { type QueryFunction, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { useMemo } from 'react';
import { type EdgeItem, FdmSDK, type Query, type NodeItem } from '../utilities/FdmSDK';
import {
  type SceneConfigurationProperties,
  type Cdf3dRevisionProperties,
  type Transformation3d,
  type Cdf3dImage360CollectionProperties,
  type GroundPlaneProperties,
  type SkyboxProperties
} from '../hooks/types';
import { Euler, MathUtils, Matrix4 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import {
  type AddReveal3DModelOptions,
  type AddImage360CollectionDatamodelsOptions
} from '../components/Reveal3DResources/types';
import { type GroundPlane, type Skybox } from '../components/SceneContainer/sceneTypes';

export type Space = string;
export type ExternalId = string;

export type SceneData = {
  name: string;
  cameraTranslationX: number;
  cameraTranslationY: number;
  cameraTranslationZ: number;
  cameraEulerRotationX: number;
  cameraEulerRotationY: number;
  cameraEulerRotationZ: number;
  cadModelOptions: AddReveal3DModelOptions[];
  image360CollectionOptions: AddImage360CollectionDatamodelsOptions[];
  groundPlanes: GroundPlane[];
  skybox?: Skybox;
};

type Use3dScenesQueryResult = {
  scenes: Array<NodeItem<SceneConfigurationProperties>>;
  sceneModels: Array<EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>>>;
  scene360Collections: Array<
    EdgeItem<Record<string, Record<string, Cdf3dImage360CollectionProperties>>>
  >;
  sceneGroundPlanes: Array<NodeItem<GroundPlaneProperties>>;
  sceneGroundPlaneEdges: Array<EdgeItem<Record<string, Record<string, Transformation3d>>>>;
  sceneSkybox: Array<NodeItem<SkyboxProperties>>;
};

export const use3dScenes = (
  userSdk?: CogniteClient
): UseQueryResult<Record<Space, Record<ExternalId, SceneData>>> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const queryFunction: QueryFunction<Record<Space, Record<ExternalId, SceneData>>> = async () => {
    const scenesQuery = createGetScenesQuery();

    try {
      const queryResult = (await fdmSdk.queryNodesAndEdges(scenesQuery))
        .items as Use3dScenesQueryResult;

      const scenesMap = createMapOfScenes(queryResult.scenes, queryResult.sceneSkybox);
      populateSceneMapWithModels(queryResult.sceneModels, scenesMap);
      populateSceneMapWith360Images(queryResult.scene360Collections, scenesMap);
      populateSceneMapWithGroundplanes(
        queryResult.sceneGroundPlanes,
        queryResult.sceneGroundPlaneEdges,
        scenesMap
      );

      return scenesMap;
    } catch (error) {
      console.warn("Scene space doesn't exist or has no scenes with 3D models");
      return {};
    }
  };

  return useQuery<Record<Space, Record<ExternalId, SceneData>>>({
    queryKey: ['reveal-react-components', 'cdf', '3d', 'scenes'],
    queryFn: queryFunction
  });
};

function createMapOfScenes(
  scenes: Array<NodeItem<SceneConfigurationProperties>>,
  skyboxes: Array<NodeItem<SkyboxProperties>>
): Record<Space, Record<ExternalId, SceneData>> {
  return scenes.reduce(
    (
      acc: Record<Space, Record<ExternalId, SceneData>>,
      scene: NodeItem<SceneConfigurationProperties>
    ) => {
      const { space, externalId } = scene;
      const properties = Object.values(Object.values(scene.properties)[0])[0];
      if (acc[space] === undefined) {
        acc[space] = {};
      }
      if (acc[space][externalId] === undefined) {
        let skyboxObject: SkyboxProperties | undefined;
        const skyboxIdentifier = properties.skybox;
        if (skyboxIdentifier !== undefined) {
          const connectedSkybox = skyboxes.find(
            (skybox) =>
              skybox.externalId === skyboxIdentifier.externalId &&
              skybox.space === skyboxIdentifier.space
          );
          if (connectedSkybox !== undefined) {
            const skyboxProperties = Object.values(Object.values(connectedSkybox.properties)[0])[0];
            skyboxObject = skyboxProperties;
          }
        }

        acc[space][externalId] = {
          name: properties.name,
          cameraTranslationX: properties.cameraTranslationX,
          cameraTranslationY: properties.cameraTranslationY,
          cameraTranslationZ: properties.cameraTranslationZ,
          cameraEulerRotationX: properties.cameraEulerRotationX,
          cameraEulerRotationY: properties.cameraEulerRotationY,
          cameraEulerRotationZ: properties.cameraEulerRotationZ,
          cadModelOptions: [],
          image360CollectionOptions: [],
          groundPlanes: [],
          skybox: skyboxObject
        };
      }

      return acc;
    },
    {}
  );
}

function populateSceneMapWithModels(
  scene360Images: Array<EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>>>,
  scenesMap: Record<Space, Record<ExternalId, SceneData>>
): void {
  scene360Images.forEach((edge) => {
    const { space, externalId } = edge.startNode;

    const properties = Object.values(Object.values(edge.properties)[0])[0];

    const newModelId = Number(edge.endNode.externalId);
    const newModelRevisionId = Number(properties?.revisionId);

    if (isNaN(newModelId) || isNaN(newModelRevisionId)) {
      return;
    }

    if (scenesMap[space]?.[externalId] === undefined) {
      return;
    }

    const transform = createTransformFromEdge(properties);
    const newModel = {
      modelId: newModelId,
      revisionId: newModelRevisionId,
      transformation: transform
    };

    scenesMap[space]?.[externalId].cadModelOptions.push(newModel);
  });
}

function populateSceneMapWith360Images(
  scene360Images: Array<
    EdgeItem<Record<string, Record<string, Cdf3dImage360CollectionProperties>>>
  >,
  scenesMap: Record<Space, Record<ExternalId, SceneData>>
): void {
  scene360Images.forEach((edge) => {
    const { space, externalId } = edge.startNode;

    if (scenesMap[space]?.[externalId] === undefined) {
      return;
    }

    const properties = Object.values(Object.values(edge.properties)[0])[0];
    const transform = createTransformFromEdge(properties);
    const newImage360Collection: AddImage360CollectionDatamodelsOptions = {
      externalId: properties.image360CollectionExternalId,
      space: properties.image360CollectionSpace,
      transform
    };

    scenesMap[space]?.[externalId].image360CollectionOptions.push(newImage360Collection);
  });
}

function populateSceneMapWithGroundplanes(
  sceneGroundPlanes: Array<NodeItem<GroundPlaneProperties>>,
  sceneGroundPlaneEdges: Array<EdgeItem<Record<string, Record<string, Transformation3d>>>>,
  scenesMap: Record<Space, Record<ExternalId, SceneData>>
): void {
  sceneGroundPlaneEdges.forEach((edge) => {
    const { space, externalId } = edge.startNode;

    const mappedGroundPlane = sceneGroundPlanes.find(
      (groundPlane) =>
        groundPlane.externalId === edge.endNode.externalId &&
        groundPlane.space === edge.endNode.space
    );

    if (scenesMap[space]?.[externalId] === undefined || mappedGroundPlane === undefined) {
      return;
    }

    const groundPlaneEdgeProperties = Object.values(Object.values(edge.properties)[0])[0];
    const groundPlaneProperties = Object.values(Object.values(mappedGroundPlane.properties)[0])[0];

    const groundPlane: GroundPlane = {
      label: groundPlaneProperties.label,
      file: groundPlaneProperties.file,
      wrapping: groundPlaneProperties.wrapping,
      repeatU: groundPlaneProperties.repeatU ?? 1,
      repeatV: groundPlaneProperties.repeatV ?? 1,
      ...groundPlaneEdgeProperties // Transformation3d
    };

    scenesMap[space]?.[externalId].groundPlanes.push(groundPlane);
  });
}

function createTransformFromEdge(properties: Transformation3d): Matrix4 {
  const transform = new Matrix4();

  transform.makeRotationFromEuler(
    new Euler(
      MathUtils.degToRad(properties.eulerRotationX),
      MathUtils.degToRad(properties.eulerRotationY),
      MathUtils.degToRad(properties.eulerRotationZ)
    )
  );

  fixModelScale(properties);

  const scaleMatrix = new Matrix4().makeScale(
    properties.scaleX,
    properties.scaleY,
    properties.scaleZ
  );
  transform.multiply(scaleMatrix);

  const translation = new Matrix4().makeTranslation(
    properties.translationX,
    properties.translationY,
    properties.translationZ
  );
  transform.premultiply(translation);

  transform.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

  return transform;
}

function fixModelScale(modelProps: Transformation3d): Transformation3d {
  if (modelProps.scaleX === 0) {
    modelProps.scaleX = 1;
  }
  if (modelProps.scaleY === 0) {
    modelProps.scaleY = 1;
  }
  if (modelProps.scaleZ === 0) {
    modelProps.scaleZ = 1;
  }

  return modelProps;
}

function createGetScenesQuery(limit: number = 100): Query {
  return {
    with: {
      scenes: {
        nodes: {
          filter: {
            hasData: [
              {
                type: 'view',
                space: 'scene',
                externalId: 'SceneConfiguration',
                version: 'v1'
              }
            ]
          }
        },
        limit
      },
      sceneModels: {
        edges: {
          from: 'scenes',
          maxDistance: 1,
          direction: 'outwards',
          filter: {
            equals: {
              property: ['edge', 'type'],
              value: {
                space: 'scene',
                externalId: 'SceneConfiguration.model3ds'
              }
            }
          }
        },
        limit
      },
      scene360Collections: {
        edges: {
          from: 'scenes',
          maxDistance: 1,
          direction: 'outwards',
          filter: {
            equals: {
              property: ['edge', 'type'],
              value: {
                space: 'scene',
                externalId: 'SceneConfiguration.images360Collections'
              }
            }
          }
        },
        limit
      },
      sceneSkybox: {
        nodes: {
          from: 'scenes',
          through: {
            view: {
              type: 'view',
              space: 'scene',
              externalId: 'SceneConfiguration',
              version: 'v1'
            },
            identifier: 'skybox'
          },
          direction: 'outwards'
        },
        limit
      },
      sceneGroundPlaneEdges: {
        edges: {
          from: 'scenes',
          maxDistance: 1,
          direction: 'outwards',
          filter: {
            equals: {
              property: ['edge', 'type'],
              value: {
                space: 'scene',
                externalId: 'SceneConfiguration.texturedGroundPlanes'
              }
            }
          }
        },
        limit
      },
      sceneGroundPlanes: {
        nodes: {
          from: 'sceneGroundPlaneEdges',
          chainTo: 'destination'
        },
        limit
      }
    },
    select: {
      scenes: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'SceneConfiguration',
              version: 'v1'
            },
            properties: [
              'name',
              'skybox',
              'cameraTranslationX',
              'cameraTranslationY',
              'cameraTranslationZ',
              'cameraEulerRotationX',
              'cameraEulerRotationY',
              'cameraEulerRotationZ'
            ]
          }
        ]
      },
      sceneModels: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'RevisionProperties',
              version: 'v1'
            },
            properties: ['*']
          }
        ]
      },
      scene360Collections: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'Image360CollectionProperties',
              version: 'v1'
            },
            properties: ['*']
          }
        ]
      },
      sceneSkybox: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'EnvironmentMap',
              version: 'v1'
            },
            properties: ['label', 'file', 'isSpherical']
          }
        ]
      },
      sceneGroundPlaneEdges: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'cdf_3d_schema',
              externalId: 'Transformation3d',
              version: 'v1'
            },
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
        ]
      },
      sceneGroundPlanes: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'TexturedPlane',
              version: 'v1'
            },
            properties: ['*']
          }
        ]
      }
    }
  };
}
