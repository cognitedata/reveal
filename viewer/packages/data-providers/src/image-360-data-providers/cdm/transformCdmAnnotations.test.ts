/*!
 * Copyright 2025 Cognite AS
 */
import { Vector3 } from 'three';
import { transformAnnotations } from './transformCdmAnnotations';
import { mockGetImage360WithAnnotationsFromRevisionResponse } from '../../../../../test-utilities/src/fixtures/dmsResponses/mockGetImage360WithAnnotationsFromRevisionResponse';
import { GetImage360FromRevisionResponse } from './fetchCoreDm360AnnotationsForRevision';

describe('transformAnnotations', () => {
  it.each([undefined, '', 'not-a-semantic-version', '0.1.0', '1.0.0'])(
    'transforms annotation correctly with formatVersion being %s',
    formatVersion => {
      const mockQueryResponse = getMockresponseWithFormatVersion(formatVersion);
      const result = transformAnnotations(mockQueryResponse);

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
      expect(annotation.polygon).toHaveLength(4);

      annotation.polygon.forEach((vec, index) => {
        const expectedVector = expectedPolygon[index];
        expect(vec.x).toBeCloseTo(expectedVector.x, 5);
        expect(vec.y).toBeCloseTo(expectedVector.y, 5);
        expect(vec.z).toBeCloseTo(expectedVector.z, 5);
      });
    }
  );

  it.each(['1.0.1', '1.0.2', '2.0.0'])(
    'transforms annotation correctly with formatVersion being >= 1.0.1, testing version: %s',
    formatVersion => {
      const mockQueryResponse = getMockresponseWithFormatVersion(formatVersion);
      const result = transformAnnotations(mockQueryResponse);

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
      expect(annotation.polygon).toHaveLength(4);

      annotation.polygon.forEach((vec, index) => {
        const expectedVector = expectedPolygon[index];
        expect(vec.x).toBeCloseTo(expectedVector.x, 5);
        expect(vec.y).toBeCloseTo(expectedVector.y, 5);
        expect(vec.z).toBeCloseTo(expectedVector.z, 5);
      });
    }
  );
});

function getMockresponseWithFormatVersion(formatVersion: string | undefined): GetImage360FromRevisionResponse {
  return {
    ...mockGetImage360WithAnnotationsFromRevisionResponse,
    items: {
      ...mockGetImage360WithAnnotationsFromRevisionResponse.items,
      annotations: [
        {
          ...mockGetImage360WithAnnotationsFromRevisionResponse.items.annotations[0],
          properties: {
            cdf_cdm: {
              'Cognite360ImageAnnotation/v1': {
                ...mockGetImage360WithAnnotationsFromRevisionResponse.items.annotations[0].properties['cdf_cdm'][
                  'Cognite360ImageAnnotation/v1'
                ],
                formatVersion
              }
            }
          }
        }
      ]
    }
  };
}
