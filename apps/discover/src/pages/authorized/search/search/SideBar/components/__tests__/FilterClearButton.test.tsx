import { screen, fireEvent } from '@testing-library/react';

import {
  getEmptyAppliedFilterType,
  getMockAppliedFiltersType,
} from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';

import { FilterClearButton, Props } from '../FilterClearButton';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('modules/sidebar/selectors', () => ({
  useFilterAppliedFilters: jest.fn(),
}));

describe('FilterClearButton', () => {
  const page = (viewProps?: Props) =>
    testRenderer(FilterClearButton, undefined, viewProps);

  const defaultTestInit = async (viewProps?: Props) => page(viewProps);

  it('should not render filter clear button for no applied filters', async () => {
    const appliedFilters = getEmptyAppliedFilterType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    await defaultTestInit({
      displayClear: true,
      category: 'wells',
    });

    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('should render filter clear button correctly', async () => {
    const appliedFilters = getMockAppliedFiltersType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    await defaultTestInit({
      displayClear: true,
      category: 'wells',
    });

    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('should fire a clear event', async () => {
    const appliedFilters = getMockAppliedFiltersType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    const handleClearFilters = jest.fn();
    await defaultTestInit({
      displayClear: true,
      category: 'wells',
      handleClearFilters,
    });

    const clearButton = screen.getByTestId('clear-button');
    fireEvent.click(clearButton);
    expect(handleClearFilters).toBeCalledTimes(1);
  });
});
