import { getMockGeometry } from '__test-utils/fixtures/geometry';
import { getMockSearchQueryWithFacets } from 'modules/documentSearch/__tests__/utils';

import { getSearchQuery } from '../getSearchQuery';

describe('Test query builder', () => {
  describe('Test facet building', () => {
    it(`File type facet should transform to IN condition`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());
      expect(result.filter?.and).toContainEqual({
        in: { property: ['type'], values: ['Image', 'PDF'] },
      });
    });

    it(`Label`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());

      expect(result.filter).not.toBeNull();
      expect(result.filter?.and).toContainEqual({
        containsAny: {
          property: ['labels'],
          values: [
            {
              externalId: 'COMPLETION_REPORT',
            },
            {
              externalId: 'COMPLETION_SCHEMATIC',
            },
          ],
        },
      });
    });

    it(`source`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());

      expect(result.filter).not.toBeNull();
      expect(result.filter?.and).toContainEqual({
        in: {
          property: ['sourceFile', 'source'],
          values: ['bp-blob', 'bp-edm-attachment'],
        },
      });
    });

    it('geolocation with extraGeoJsonFilters', () => {
      const geoJson = getMockGeometry();
      const result = getSearchQuery(
        getMockSearchQueryWithFacets({
          extraGeoJsonFilters: [
            {
              label: 'Test',
              geoJson,
            },
          ],
        })
      );
      expect(result.filter?.and).toContainEqual(
        expect.objectContaining({
          geojsonIntersects: {
            geometry: geoJson,
            property: ['geoLocation'],
          },
        })
      );
    });

    it('geolocation with geoFilter', () => {
      const geometry = getMockGeometry();
      const result = getSearchQuery(
        getMockSearchQueryWithFacets({
          geoFilter: [{ geometry }],
        })
      );
      expect(result.filter?.and).toContainEqual(
        expect.objectContaining({
          geojsonIntersects: {
            geometry,
            property: ['geoLocation'],
          },
        })
      );
    });
  });
});
