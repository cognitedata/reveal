/*!
 * Copyright 2025 Cognite AS
 */
import { Vector3 } from 'three';
import { transformAnnotations } from './transformCdmAnnotations';
import { GetImage360FromRevisionResponse } from './fetchCoreDm360AnnotationsForRevision';

describe('transformAnnotations', () => {
  it.each(['', '1.0.0'])('transforms annotation correctly with formatVersion being %s', format => {
    const result = transformAnnotations({
      ...mockQueryResponse,
      items: {
        ...mockQueryResponse.items,
        annotations: [
          {
            ...mockQueryResponse.items.annotations[0],
            properties: {
              cdf_cdm: {
                'Cognite360ImageAnnotation/v1': {
                  ...mockQueryResponse.items.annotations[0].properties['cdf_cdm']['Cognite360ImageAnnotation/v1'],
                  formatVersion: format
                }
              }
            }
          }
        ]
      }
    });

    const expectedAnnotation = mockQueryResponse.items.annotations[0];
    const expectedImage = mockQueryResponse.items.images[0];
    const expectedPolygon = [
      new Vector3(0.49175782016185093, -0.5804020210511138, 0.6490822292047802),
      new Vector3(0.6409302937841888, -0.4454302492298073, 0.6251401855430387),
      new Vector3(0.7321201335130068, -0.2527013757802284, 0.6325678815618738),
      new Vector3(0.7472307918925782, -0.026952703551969714, 0.6640178426961356)
    ];

    expect(result).toHaveLength(1);
    const annotation = result[0];
    expect(annotation.sourceType).toBe('dm');
    expect(annotation.status).toBe('approved');
    expect(annotation.connectedImageId).toEqual({ externalId: expectedImage.externalId, space: expectedImage.space });
    expect(annotation.annotationIdentifier).toEqual({
      externalId: expectedAnnotation.externalId,
      space: expectedAnnotation.space
    });
    expect(Array.isArray(annotation.polygon)).toBe(true);
    expect(annotation.polygon.length).toBe(4);

    annotation.polygon.forEach((vec, index) => {
      const expectedVector = expectedPolygon[index];
      expect(vec.x).toBeCloseTo(expectedVector.x, 5);
      expect(vec.y).toBeCloseTo(expectedVector.y, 5);
      expect(vec.z).toBeCloseTo(expectedVector.z, 5);
    });
  });

  it('transforms annotation correctly with formatVersion being 1.0.1', () => {
    const result = transformAnnotations({
      ...mockQueryResponse,
      items: {
        ...mockQueryResponse.items,
        annotations: [
          {
            ...mockQueryResponse.items.annotations[0],
            properties: {
              cdf_cdm: {
                'Cognite360ImageAnnotation/v1': {
                  ...mockQueryResponse.items.annotations[0].properties['cdf_cdm']['Cognite360ImageAnnotation/v1'],
                  formatVersion: '1.0.1'
                }
              }
            }
          }
        ]
      }
    });

    const expectedAnnotation = mockQueryResponse.items.annotations[0];
    const expectedImage = mockQueryResponse.items.images[0];
    const expectedPolygon = [
      new Vector3(0.9981226799539127, -0.0361467469224005, -0.04944217277331531),
      new Vector3(0.9894776427275844, 0.12456864216054359, 0.0735978799459675),
      new Vector3(0.9398412748644249, 0.23087393329084516, 0.25178483867784096),
      new Vector3(0.8479840555043834, 0.2671734679906693, 0.45775690012514014)
    ];

    expect(result).toHaveLength(1);
    const annotation = result[0];
    expect(annotation.sourceType).toBe('dm');
    expect(annotation.status).toBe('approved');
    expect(annotation.connectedImageId).toEqual({ externalId: expectedImage.externalId, space: expectedImage.space });
    expect(annotation.annotationIdentifier).toEqual({
      externalId: expectedAnnotation.externalId,
      space: expectedAnnotation.space
    });
    expect(Array.isArray(annotation.polygon)).toBe(true);
    expect(annotation.polygon.length).toBe(4);

    annotation.polygon.forEach((vec, index) => {
      const expectedVector = expectedPolygon[index];
      expect(vec.x).toBeCloseTo(expectedVector.x, 5);
      expect(vec.y).toBeCloseTo(expectedVector.y, 5);
      expect(vec.z).toBeCloseTo(expectedVector.z, 5);
    });
  });
});

const mockQueryResponse = {
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
