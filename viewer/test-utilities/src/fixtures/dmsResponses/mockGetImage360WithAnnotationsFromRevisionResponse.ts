/*!
 * Copyright 2025 Cognite AS
 */

import { GetImage360FromRevisionResponse } from '../../../../packages/data-providers/src/image-360-data-providers/cdm/fetchCoreDm360AnnotationsForRevision';

export const mockGetImage360WithAnnotationsFromRevisionResponse = {
  items: {
    annotations: [
      {
        instanceType: 'edge',
        version: 1,
        type: {
          space: 'mock_space',
          externalId: 'mock-image-360-annotation'
        },
        space: 'mock_annotation_space',
        externalId: 'mock-annotation-external-id',
        createdTime: 1111111111111,
        lastUpdatedTime: 2222222222222,
        startNode: {
          space: 'mock_space',
          externalId: 'mock-object3d-external-id'
        },
        endNode: {
          space: 'mock_space',
          externalId: 'mock-image-external-id'
        },
        properties: {
          cdf_cdm: {
            'Cognite360ImageAnnotation/v1': {
              polygon: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
              formatVersion: ''
            }
          }
        }
      }
    ],
    images: [
      {
        instanceType: 'node',
        version: 1,
        space: 'mock_space',
        externalId: 'mock-image-external-id',
        createdTime: 3333333333333,
        lastUpdatedTime: 4444444444444,
        properties: {
          cdf_cdm: {
            'Cognite360Image/v1': {
              station360: {
                space: 'mock_space',
                externalId: 'mock-station-external-id'
              },
              takenAt: 222222222,
              collection360: {
                space: 'mock_space',
                externalId: 'mock-collection-external-id'
              },
              scaleX: 1,
              scaleY: 1,
              scaleZ: 1,
              translationX: 0,
              translationY: 0,
              translationZ: 0,
              eulerRotationX: 10,
              eulerRotationY: 20,
              eulerRotationZ: 30,
              top: {
                space: 'mock_space',
                externalId: 'mock-image-top'
              },
              back: {
                space: 'mock_space',
                externalId: 'mock-image-back'
              },
              left: {
                space: 'mock_space',
                externalId: 'mock-image-left'
              },
              front: {
                space: 'mock_space',
                externalId: 'mock-image-front'
              },
              right: {
                space: 'mock_space',
                externalId: 'mock-image-right'
              },
              bottom: {
                space: 'mock_space',
                externalId: 'mock-image-bottom'
              }
            }
          }
        }
      }
    ],
    assets: [
      {
        instanceType: 'node',
        version: 1,
        space: 'mock_space',
        externalId: 'mock-asset-external-id',
        createdTime: 5555555555555,
        lastUpdatedTime: 6666666666666,
        properties: {
          cdf_cdm: {
            'CogniteAsset/v1': {
              name: 'Mock Asset Name',
              description: 'Mock asset description',
              object3D: {
                space: 'mock_space',
                externalId: 'mock-object3d-external-id'
              }
            }
          }
        }
      }
    ],
    object3d: [
      {
        instanceType: 'node',
        version: 666,
        space: 'mock_space',
        externalId: 'mock-object3d-external-id',
        createdTime: 7777777777777,
        lastUpdatedTime: 8888888888888,
        properties: {}
      }
    ]
  },
  nextCursor: {}
} as const satisfies GetImage360FromRevisionResponse;
