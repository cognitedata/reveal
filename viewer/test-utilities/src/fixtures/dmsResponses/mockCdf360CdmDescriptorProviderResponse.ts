/*!
 * Copyright 2025 Cognite AS
 */

import { HttpResponse } from '@cognite/sdk';

type ImageCollectionNode = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  properties: {
    cdf_cdm: {
      'Cognite360ImageCollection/v1': {
        name: string;
      };
    };
  };
};

type ImageNode = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  properties: {
    cdf_cdm: {
      'Cognite360Image/v1': {
        top: { externalId: string; space: string };
        back: { externalId: string; space: string };
        left: { externalId: string; space: string };
        front: { externalId: string; space: string };
        right: { externalId: string; space: string };
        bottom: { externalId: string; space: string };
        collection360: { space: string; externalId: string };
        station360: { space: string; externalId: string };
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
    };
  };
};

const createImageNode = (externalId: string, stationId: string, translation: number, rotation: number): ImageNode => ({
  instanceType: 'node',
  version: 1,
  space: 'test_space',
  externalId,
  createdTime: 0,
  lastUpdatedTime: 0,
  properties: {
    cdf_cdm: {
      'Cognite360Image/v1': {
        top: { externalId: 'test_image_3_Top', space: 'test_space' },
        back: { externalId: 'test_image_3_Back', space: 'test_space' },
        left: { externalId: 'test_image_3_Left', space: 'test_space' },
        front: { externalId: 'test_image_3_Front', space: 'test_space' },
        right: { externalId: 'test_image_3_Right', space: 'test_space' },
        bottom: { externalId: 'test_image_3_Bottom', space: 'test_space' },
        collection360: { space: 'test_space', externalId: 'test_collection' },
        station360: { space: 'test_space', externalId: stationId },
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        translationX: translation,
        translationY: translation,
        translationZ: translation,
        eulerRotationX: rotation,
        eulerRotationY: rotation,
        eulerRotationZ: rotation
      }
    }
  }
});

export const mockCdf360CdmDescriptorProviderResponse: HttpResponse<{
  items: {
    image_collection: ImageCollectionNode[];
    images: ImageNode[];
    stations: unknown[];
  };
}> = {
  headers: {
    'content-type': 'application/json',
    'x-request-id': '87518dc6-0c61-9ef0-9588-94f61ab5a450'
  },
  status: 200,
  data: {
    items: {
      image_collection: [
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_collection',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_cdm: {
              'Cognite360ImageCollection/v1': {
                name: 'Test Collection'
              }
            }
          }
        }
      ],
      images: [
        createImageNode('test_image_1', 'test_station_1', 0, 0),
        createImageNode('test_image_2', 'test_station_2', 1, 1),
        createImageNode('test_image_3', 'test_station_3', 3, 3)
      ],
      stations: []
    }
  }
};
