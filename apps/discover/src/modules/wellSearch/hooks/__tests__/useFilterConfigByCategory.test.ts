import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { getMockFilterConfig } from '__test-utils/fixtures/well';
import { QueryClientWrapper } from '__test-utils/queryClientWrapper';
import { FilterConfig } from 'modules/wellSearch/types';

import {
  useFilterConfigByCategory,
  filterCategoricalData,
} from '../useFilterConfigByCategory';

const mockFilterConfigs = jest.fn();
jest.mock('modules/wellSearch/utils/sidebarFilters', () => ({
  filterConfigs: () => {
    return mockFilterConfigs();
  },
}));

describe('useFilterConfigByCategory', () => {
  const mockFilterConfigsValue = async (filterConfigs: FilterConfig[]) =>
    mockFilterConfigs.mockReturnValue(filterConfigs);

  const getFilterConfigByCategory = () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFilterConfigByCategory(),
      { wrapper: QueryClientWrapper }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return result as expected', async () => {
    const filterConfigWithKey = getMockFilterConfig({ key: 'overview' });
    const filterConfigWithoutKey = getMockFilterConfig({ key: undefined });
    await mockFilterConfigsValue([filterConfigWithKey, filterConfigWithoutKey]);

    await waitFor(() => {
      const filterConfigByCategory = getFilterConfigByCategory();
      expect(filterConfigByCategory.length).toEqual(1);
    });
  });
});

describe('useFilterConfigByCategory -> filterCategoricalData', () => {
  it('should return result as expected', () => {
    const filterConfig = getMockFilterConfig();
    const categoricalData = filterCategoricalData([filterConfig])[0];

    expect(categoricalData.filterConfigIds).toEqual([filterConfig.id]);
    expect(categoricalData.filterConfigs).toEqual([filterConfig]);
    expect(categoricalData.title).toEqual(filterConfig.category);
  });

  it('should return result with an empty string as category for given input', () => {
    const filterConfig = getMockFilterConfig({ category: undefined });
    const categoricalData = filterCategoricalData([filterConfig])[0];

    expect(categoricalData.filterConfigIds).toEqual([filterConfig.id]);
    expect(categoricalData.filterConfigs).toEqual([filterConfig]);
    expect(categoricalData.title).toEqual('');
  });
});
