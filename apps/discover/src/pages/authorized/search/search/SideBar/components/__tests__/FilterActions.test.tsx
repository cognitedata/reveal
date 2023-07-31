import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { getMockAppliedFiltersType } from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';

import { FilterActions } from '../FilterActions';

jest.mock('modules/sidebar/selectors', () => ({
  useFilterAppliedFilters: jest.fn(),
  useFilterCategory: jest.fn(),
}));

describe('FilterActions', () => {
  beforeEach(() => {
    const appliedFilters = getMockAppliedFiltersType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
  });

  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(FilterActions, viewStore, viewProps);

  const filterActionsPropsMock = {
    category: 'documents',
    displayClear: false,
    displayCategorySwitch: false,
    displayBetaSymbol: false,
    handleClearFilters: jest.fn(),
  };

  const testInit = async (viewProps: any) => {
    const store = getMockedStore();

    return {
      ...page(store, viewProps),
    };
  };

  it('should not render any filter actions without optional props', async () => {
    await testInit({ category: 'documents' });

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Filter Categories')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('beta-symbol')).not.toBeInTheDocument();
  });

  it('should render `Clear` button as expected', async () => {
    await testInit({
      ...filterActionsPropsMock,
      displayClear: true,
    });
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should render `CategorySwitch` as expected', async () => {
    await testInit({
      ...filterActionsPropsMock,
      displayCategorySwitch: true,
    });
    expect(screen.getByLabelText('Filter Categories')).toBeInTheDocument();
  });

  it('should call `handleClearFilters` once when `Clear` button is clicked once.', async () => {
    await testInit({
      ...filterActionsPropsMock,
      displayClear: true,
    });
    fireEvent.click(screen.getByText('Clear'));
    expect(filterActionsPropsMock.handleClearFilters.mock.calls.length).toBe(1);
  });
});
