/*!
 * Copyright 2025 Cognite AS
 */
import { Vector3 } from 'three';
import { transformAnnotations } from './transformCdmAnnotations';
import { mockGetImage360WithAnnotationsFromRevisionResponse } from '../../../../../test-utilities/src/fixtures/dmsResponses/mockGetImage360WithAnnotationsFromRevisionResponse';
import { GetImage360FromRevisionResponse } from './fetchCoreDm360AnnotationsForRevision';

describe(transformAnnotations.name, () => {
  const annotationDataV1 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  const annotationDataV2 = [4, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 4, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  it.each([undefined, '', 'not-a-semantic-version', '0.1.0', '1.0.0'])(
    'transforms annotation correctly with formatVersion being %s',
    formatVersion => {
      const mockQueryResponse = getMockresponseWithFormatVersion(formatVersion, annotationDataV1);
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

  // Different rotation order for format versions >= 1.0.1
  it.each(['1.0.1', '1.0.2'])(
    'transforms annotation correctly with formatVersion being >= 1.0.1, testing version: %s',
    formatVersion => {
      const mockQueryResponse = getMockresponseWithFormatVersion(formatVersion, annotationDataV1);
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

  it.each(['2.0.0', '2.0.1'])(
    'transforms annotation correctly with formatVersion being >= 2.0.0, testing version: %s',
    formatVersion => {
      const mockQueryResponse = getMockresponseWithFormatVersion(formatVersion, annotationDataV2);
      const result = transformAnnotations(mockQueryResponse);

      const expectedAnnotation = mockQueryResponse.items.annotations[0];
      const expectedImage = mockQueryResponse.items.images[0];
      const expectedPolygons = [
        [
          new Vector3(0.9981226799539127, -0.0361467469224005, -0.04944217277331531),
          new Vector3(0.9894776427275844, 0.12456864216054359, 0.0735978799459675),
          new Vector3(0.9398412748644249, 0.23087393329084516, 0.25178483867784096),
          new Vector3(0.8479840555043834, 0.2671734679906693, 0.45775690012514014)
        ],
        [
          new Vector3(0.9987601312199766, 0.04963955720388502, 0.0037569463739652864),
          new Vector3(0.9699153046996458, 0.1857489452243523, 0.15735828881070538),
          new Vector3(0.8991711301565751, 0.25831273284944156, 0.35322204169728744),
          new Vector3(0.7865350961831251, 0.25733679814275057, 0.5613735964523441)
        ]
      ];

      expect(result).toHaveLength(2);

      result.forEach((annotation, polygonIndex) => {
        const expectedPolygon = expectedPolygons[polygonIndex];

        expect(annotation.sourceType).toBe('dm');
        expect(annotation.status).toBe('approved');
        expect(annotation.connectedImageId).toEqual({
          externalId: expectedImage.externalId,
          space: expectedImage.space
        });
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
      });
    }
  );
});

function getMockresponseWithFormatVersion(
  formatVersion: string | undefined,
  annotationData: number[]
): GetImage360FromRevisionResponse {
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
                polygon: annotationData,
                formatVersion
              }
            }
          }
        }
      ]
    }
  };
}
