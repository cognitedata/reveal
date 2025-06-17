import { describe, expect, test } from 'vitest';

import { buildAssetIdFilter, buildQueryFilter, combineAdvancedFilters } from './buildFilter';

const TEST_INTERNAL_IDS = [1, 2, 3];
const TEST_INTERNAL_ID_EITHERS = TEST_INTERNAL_IDS.map((id) => ({ id }));

const TEST_EXTERNAL_IDS = ['externalId1', 'externalId2', 'externalId3'];
const TEST_EXTERNAL_ID_EITHERS = TEST_EXTERNAL_IDS.map((id) => ({ externalId: id }));

describe('buildFilter', () => {
  describe(buildQueryFilter.name, () => {
    test('builds no filter for empty query', () => {
      expect(buildQueryFilter('')).toBeUndefined();
    });
    test('builds filter for non-empty query', () => {
      expect(buildQueryFilter('some-query')).toEqual({
        or: [
          { search: { property: ['name'], value: 'some-query' } },
          { search: { property: ['description'], value: 'some-query' } }
        ]
      });
    });
  });

  describe(buildAssetIdFilter.name, () => {
    test('returns undefined for no input assets', () => {
      expect(buildAssetIdFilter([])).toBeUndefined();
    });

    test('builds filter for internal ids', () => {
      const filter = buildAssetIdFilter(TEST_INTERNAL_ID_EITHERS);

      expect(filter).toEqual({ in: { property: ['id'], values: TEST_INTERNAL_IDS } });
    });

    test('builds filter for external ids', () => {
      const filter = buildAssetIdFilter(TEST_EXTERNAL_ID_EITHERS);

      expect(filter).toEqual({
        in: { property: ['externalId'], values: TEST_EXTERNAL_IDS }
      });
    });

    test('builds filter for both internal and  external ids', () => {
      const filter = buildAssetIdFilter([...TEST_INTERNAL_ID_EITHERS, ...TEST_EXTERNAL_ID_EITHERS]);

      expect(filter).toEqual({
        and: [
          {
            in: { property: ['externalId'], values: TEST_EXTERNAL_IDS }
          },
          {
            in: { property: ['id'], values: TEST_INTERNAL_IDS }
          }
        ]
      });
    });
  });

  describe(combineAdvancedFilters.name, () => {
    test('returns undefined if filter list is empty', () => {
      expect(combineAdvancedFilters([])).toEqual(undefined);
    });

    test('returns undefined if no defined filters exist', () => {
      expect(combineAdvancedFilters([undefined, undefined])).toEqual(undefined);
    });

    test('returns first filter if second is undefined', () => {
      const filter = { equals: { property: ['prop1'], value: 'value1' } };

      const resultFilter = combineAdvancedFilters([filter, undefined]);

      expect(resultFilter).toEqual(filter);
    });

    test('returns second filter if first is undefined', () => {
      const filter = { equals: { property: ['prop1'], value: 'value1' } };

      const resultFilter = combineAdvancedFilters([undefined, filter]);

      expect(resultFilter).toEqual(filter);
    });

    test('combines two filters', () => {
      const filter0 = { equals: { property: ['prop0'], value: 'value0' } };
      const filter1 = { equals: { property: ['prop1'], value: 'value1' } };

      const resultFilter = combineAdvancedFilters([filter0, filter1]);

      expect(resultFilter).toEqual({ and: [filter0, filter1] });
    });
  });
});
