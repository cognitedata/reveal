import { getMockWellFilter } from '__test-utils/fixtures/sidebar';
import { getMockFilterConfigByCategory } from '__test-utils/fixtures/well';

import { formatWellFilters, removeAppliedFilterValue } from '../filters';

describe('getAppliedFilterValues', () => {
  it('Remove string filter value', () => {
    const appliedFilter = getMockWellFilter();
    const result = removeAppliedFilterValue(
      appliedFilter,
      2,
      appliedFilter[2][0]
    );
    expect(result[2].length).toEqual(1);
    expect(result[2]).not.toContain(appliedFilter[2][0]);
  });
  it('Remove numeric filter value', () => {
    const numericRange = {
      9: [0, 100],
    };
    const appliedFilter = getMockWellFilter(numericRange);
    const result = removeAppliedFilterValue(
      appliedFilter,
      9,
      appliedFilter[9][0]
    );
    expect(result[9]).toBeFalsy();
  });
  it('Remove date rangefilter value', () => {
    const numericRange = {
      8: [new Date(2010, 10, 30), new Date(2011, 10, 30)],
    };
    const appliedFilter = getMockWellFilter(numericRange);
    const result = removeAppliedFilterValue(
      appliedFilter,
      8,
      appliedFilter[8][0]
    );
    expect(result[8]).toBeFalsy();
  });
});

describe('getHumalizeWellFilters', () => {
  it('No applied filters empty result', () => {
    const result = formatWellFilters({}, getMockFilterConfigByCategory()[0]);
    expect(result).toEqual([]);
  });
  it('Two applied filters field values', () => {
    const result = formatWellFilters(
      getMockWellFilter({ 7: [0, 100], 8: ['1175637600000', '1619042400000'] }),
      getMockFilterConfigByCategory()[0]
    );
    expect(result.length).toEqual(4);
  });
});
