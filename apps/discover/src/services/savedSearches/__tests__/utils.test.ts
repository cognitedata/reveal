import { getFacets } from 'modules/documentSearch/utils';

import { normalizeSavedSearch } from '../normalizeSavedSearch';
import { combineOldAndNew } from '../utils';
import { getEmptyFilters } from '../utils/getEmptyFilters';

describe('Saved search utils', () => {
  describe('combineOldAndNew', () => {
    it('dont change anything is nothing is requested to be changed', () => {
      expect(
        combineOldAndNew({ geoJson: [], filters: {}, query: 'a' }, {})
      ).toEqual({
        filters: {},
        query: 'a',
        geoJson: [],
      });
    });

    it('do not update filters if they are not explicitly deleted', () => {
      expect(
        combineOldAndNew(
          {
            query: 'old query',
            filters: {
              documents: { facets: getFacets({ lastmodified: ['a'] }) },
            },
          },
          {
            query: 'new query',
          }
        )
      ).toEqual({
        query: 'new query',
        filters: {
          documents: { facets: getFacets({ lastmodified: ['a'] }) },
        },
      });
    });

    it('replace only nested filters', () => {
      expect(
        combineOldAndNew(
          {
            geoJson: [],
            query: '',
            filters: {
              documents: { facets: getFacets({ lastmodified: ['a'] }) },
            },
          },
          {
            query: 'test',
            filters: {
              documents: {
                facets: getFacets({ lastmodified: ['a'], location: ['b'] }),
              },
            },
          }
        )
      ).toEqual({
        geoJson: [],
        filters: {
          documents: {
            facets: getFacets({ lastmodified: ['a'], location: ['b'] }),
          },
        },
        query: 'test',
      });
    });

    it('delete nested filters', () => {
      expect(
        combineOldAndNew(
          {
            filters: {
              documents: { facets: getFacets({ lastmodified: ['a'] }) },
            },
          },
          {
            filters: {
              documents: { facets: getFacets({ lastmodified: [] }) },
            },
          }
        )
      ).toEqual({
        filters: {
          documents: {
            facets: getFacets(),
          },
        },
      });
    });

    it('delete nested filters by setting an empty filters object', () => {
      expect(
        combineOldAndNew(
          {
            filters: {
              documents: {
                facets: getFacets({
                  filetype: ['PDF'],
                  labels: [],
                  lastmodified: ['a'],
                }),
              },
            },
          },
          {
            filters: {},
          }
        )
      ).toEqual({
        filters: getEmptyFilters(),
      });
    });

    it('replace other things from the override object (second one)', () => {
      expect(
        combineOldAndNew(
          { query: 'before', filters: {} },
          { query: 'after', filters: {} }
        )
      ).toEqual({
        filters: getEmptyFilters(),
        query: 'after',
      });
    });

    it('replace query, and flesh out filters', () => {
      expect(
        combineOldAndNew(
          { query: 'before', filters: {} },
          { query: '', filters: {} }
        )
      ).toEqual({
        filters: getEmptyFilters(),
        query: '',
      });
    });
  });

  describe('normalizeSavedSearch', () => {
    it('should always fill in query', () => {
      expect(normalizeSavedSearch({})).toEqual({
        filters: {},
        query: '',
        sortBy: {},
        geoJson: [],
      });
    });

    it('should be ok with just query', () => {
      expect(normalizeSavedSearch({ query: 'test' })).toEqual({
        filters: {},
        query: 'test',
        sortBy: {},
        geoJson: [],
      });
    });

    it('should convert phrase', () => {
      expect(normalizeSavedSearch({ phrase: 'test' })).toEqual({
        filters: {},
        query: 'test',
        sortBy: {},
        geoJson: [],
      });
    });

    it('should turn phrase into query and keep filters', () => {
      expect(
        normalizeSavedSearch({
          phrase: 'test',
          filters: { documents: { facets: getFacets({ filetype: ['pdf'] }) } },
        })
      ).toEqual({
        filters: {
          documents: {
            facets: {
              filetype: ['pdf'],
              labels: [],
              lastcreated: [],
              lastmodified: [],
              location: [],
              pageCount: [],
            },
          },
        },
        geoJson: [],
        query: 'test',
        sortBy: {},
      });
    });

    it('should be ok with just geo', () => {
      expect(
        normalizeSavedSearch({
          geoJson: [
            { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] } },
          ],
        })
      ).toEqual({
        filters: {},
        query: '',
        geoJson: [
          {
            type: 'Feature',
            geometry: {
              coordinates: [],
              type: 'Polygon',
            },
          },
        ],
        sortBy: {},
      });
    });

    it('should handle deprecated geo type "geoFilter"', () => {
      expect(
        normalizeSavedSearch({
          geoFilter: [
            { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] } },
          ],
        })
      ).toEqual({
        filters: {},
        query: '',
        geoJson: [
          {
            type: 'Feature',
            geometry: {
              coordinates: [],
              type: 'Polygon',
            },
          },
        ],
        sortBy: {},
      });
    });

    it('should handle deprecated geo types: geometry', () => {
      expect(
        normalizeSavedSearch({
          // @ts-expect-error deprecated field
          geometry: { type: 'Polygon', coordinates: [] },
        })
      ).toEqual({
        filters: {},
        query: '',
        geoJson: [
          {
            id: 'Feature',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [],
              type: 'Polygon',
            },
          },
        ],
        sortBy: {},
      });
    });
  });
});
