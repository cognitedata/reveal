import { describe, expect, test } from 'vitest';

import {
  buildClassicAssetIdFilter,
  buildClassicAssetQueryFilter,
  combineClassicAssetFilters
} from './buildClassicAssetFilter';
import { toIdEither } from '../../utilities/instanceIds/toIdEither';

const TEST_INTERNAL_IDS = [1, 2, 3];
const TEST_INTERNAL_ID_EITHERS = TEST_INTERNAL_IDS.map(toIdEither);

const TEST_EXTERNAL_IDS = ['externalId1', 'externalId2', 'externalId3'];
const TEST_EXTERNAL_ID_EITHERS = TEST_EXTERNAL_IDS.map(toIdEither);

describe('buildFilter', () => {
  describe(buildClassicAssetQueryFilter.name, () => {
    test('builds no filter for empty query', () => {
      expect(buildClassicAssetQueryFilter('')).toBeUndefined();
    });
    test('builds filter for non-empty query', () => {
      expect(buildClassicAssetQueryFilter('some-query')).toEqual({
        or: [
          { search: { property: ['name'], value: 'some-query' } },
          { search: { property: ['description'], value: 'some-query' } }
        ]
      });
    });
  });

  describe(buildClassicAssetIdFilter.name, () => {
    test('returns undefined for no input assets', () => {
      expect(buildClassicAssetIdFilter([])).toBeUndefined();
    });

    test('builds filter for internal ids', () => {
      const filter = buildClassicAssetIdFilter(TEST_INTERNAL_ID_EITHERS);

      expect(filter).toEqual({ in: { property: ['id'], values: TEST_INTERNAL_IDS } });
    });

    test('builds filter for external ids', () => {
      const filter = buildClassicAssetIdFilter(TEST_EXTERNAL_ID_EITHERS);

      expect(filter).toEqual({
        in: { property: ['externalId'], values: TEST_EXTERNAL_IDS }
      });
    });

    test('builds filter for both internal and  external ids', () => {
      const filter = buildClassicAssetIdFilter([
        ...TEST_INTERNAL_ID_EITHERS,
        ...TEST_EXTERNAL_ID_EITHERS
      ]);

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

  describe(combineClassicAssetFilters.name, () => {
    test('returns undefined if filter list is empty', () => {
      expect(combineClassicAssetFilters([])).toEqual(undefined);
    });

    test('returns undefined if no defined filters exist', () => {
      expect(combineClassicAssetFilters([undefined, undefined])).toEqual(undefined);
    });

    test('returns first filter if second is undefined', () => {
      const filter = { equals: { property: ['prop1'], value: 'value1' } };

      const resultFilter = combineClassicAssetFilters([filter, undefined]);

      expect(resultFilter).toEqual(filter);
    });

    test('returns second filter if first is undefined', () => {
      const filter = { equals: { property: ['prop1'], value: 'value1' } };

      const resultFilter = combineClassicAssetFilters([undefined, filter]);

      expect(resultFilter).toEqual(filter);
    });

    test('combines two filters', () => {
      const filter0 = { equals: { property: ['prop0'], value: 'value0' } };
      const filter1 = { equals: { property: ['prop1'], value: 'value1' } };

      const resultFilter = combineClassicAssetFilters([filter0, filter1]);

      expect(resultFilter).toEqual({ and: [filter0, filter1] });
    });
  });
});
