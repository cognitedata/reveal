import { renderHook } from '@testing-library/react-hooks';

import { getMockWellFilter } from '__test-utils/fixtures/sidebar';
import { getMockFilterConfigByCategory } from '__test-utils/fixtures/well';
import { useFilterConfigByCategory } from 'modules/wellSearch/hooks/useFilterConfigByCategory';

import { useFormatWellFilters } from '../useAppliedFilters';

jest.mock('modules/wellSearch/hooks/useFilterConfigByCategory', () => ({
  useFilterConfigByCategory: jest.fn(),
}));

const mockFilterConfig = getMockFilterConfigByCategory();
describe('useHumanizeWellFilters', () => {
  beforeEach(() => {
    (useFilterConfigByCategory as jest.Mock).mockReturnValue(mockFilterConfig);
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFormatWellFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('Should return humanize well filters', async () => {
    const useHumanizeWellFilters = await getHookResult();
    const result = useHumanizeWellFilters(getMockWellFilter());

    expect(result).toMatchObject({
      Field: ['BOEM', 'BP-Penquin'],
      Operator: ['Atlantis', 'Mad Dog'],
    });
  });
});
