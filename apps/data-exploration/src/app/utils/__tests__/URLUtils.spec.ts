import qs from 'query-string';
import { getSearchParams } from '../URLUtils';

describe('URLUtils', () => {
  describe('getSearchParams', () => {
    const opts: qs.StringifyOptions = { arrayFormat: 'comma' };
    const searchParams =
      'cluster=greenfield.cognitedata.com&env=greenfield&filter=%7B%22phrase%22%3A%22%22%2C%22filters%22%3A%7B%22asset%22%3A%7B%7D%2C%22timeseries%22%3A%7B%7D%2C%22sequence%22%3A%7B%7D%2C%22file%22%3A%7B%7D%2C%22document%22%3A%7B%7D%2C%22event%22%3A%7B%7D%2C%22common%22%3A%7B%22externalIdPrefix%22%3A%22ivm_vm%3APlatform_EG%2BEH%22%7D%7D%7D&q=';
    const parsedSearchFilter =
      '{"phrase":"","filters":{"asset":{},"timeseries":{},"sequence":{},"file":{},"document":{},"event":{},"common":{"externalIdPrefix":"ivm_vm:Platform_EG+EH"}}}';

    it('should parse correctly', () => {
      const search = getSearchParams(searchParams);
      expect(search.filter).toBe(parsedSearchFilter);
    });
    it('should parse and stringify correctly', () => {
      const search = getSearchParams(searchParams);
      const qsStringified = qs.stringify(search);
      expect(searchParams).toBe(`${qsStringified}`);
    });
    // query-string package has some struggles to stringify back when parsed with `arrayFormat: 'comma'` option.
    // These tests are added to show that they should pass but unfortunately dont,
    // so that `getSearchParams` util should take `opts` param very cautiously!
    it('should parse and stringify correctly but fails', () => {
      const search = getSearchParams(searchParams, opts);
      const qsStringified = qs.stringify(search);
      expect(searchParams).not.toBe(`${qsStringified}`);
    });
    it('should parse correctly but fails', () => {
      const parsedCommonSearchFilter =
        '"common":{"externalIdPrefix":"ivm_vm:Platform_EG+EH"}}}';
      const search = getSearchParams(searchParams, opts);
      expect(search.filter && search.filter[7]).not.toBe(
        parsedCommonSearchFilter
      );
    });
  });
});
