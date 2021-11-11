import { screen, act, fireEvent } from '@testing-library/react';
import noop from 'lodash/noop';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useSetWellsFilters } from 'modules/api/savedSearches/hooks/useClearWellsFilters';
import { FIELD_BLOCK_OPERATOR } from 'modules/wellSearch/constantsSidebarFilters';

import { FilterCategoryValues } from '../FilterCategoryValues';

jest.mock('modules/api/savedSearches/hooks/useClearWellsFilters', () => ({
  useSetWellsFilters: jest.fn(),
}));

describe('FilterCategoryValues', () => {
  beforeEach(() => {
    (useSetWellsFilters as jest.Mock).mockImplementation(() => noop);
  });
  afterEach(() => {
    (useSetWellsFilters as jest.Mock).mockClear();
  });
  const testInit = async (viewProps?: any) =>
    testRenderer(FilterCategoryValues, getMockedStore(), viewProps);

  it('should render category', async () => {
    await testInit();
    expect(await screen.findByText(FIELD_BLOCK_OPERATOR)).toBeInTheDocument();
  });

  it('should render category values', async () => {
    await testInit();
    expect(await screen.findByText('BOEM')).toBeInTheDocument();
    expect(await screen.findByText('BP-Penquin')).toBeInTheDocument();
  });

  it(`should trigger callback on remove click`, async () => {
    await act(async () => {
      await testInit();
      const button = await screen.findAllByTestId('remove-btn');
      fireEvent.click(button[0]);
      expect(useSetWellsFilters).toHaveBeenCalled();
    });
  });
});
