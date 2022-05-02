import { screen, fireEvent } from '@testing-library/react';
import constant from 'lodash/constant';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { NO_RESULTS_TEXT } from 'components/EmptyState/constants';
import * as mapActions from 'modules/map/actions';
import { useGetTypeFromGeometry } from 'modules/map/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';
import { useWellSearchResultQuery } from 'modules/wellSearch/hooks/useWellSearchResultQuery';

import { TableEmpty, TableEmptyProps } from '../TableEmpty';

jest.mock('modules/wellSearch/hooks/useWellSearchResultQuery', () => ({
  useWellSearchResultQuery: jest.fn(),
}));

jest.mock('modules/sidebar/selectors', () => ({
  useSearchPhrase: jest.fn(),
}));

jest.mock('modules/map/selectors', () => ({
  useGetTypeFromGeometry: jest.fn(),
}));
jest.mock('components/TableEmpty/FilterCategoryValues', () => ({
  FilterCategoryValues: () => <>TEST</>,
}));

const clearAllFilters = jest.fn();
const clearQuery = jest.fn();
const clearPolygon = jest.fn();

const defaultProps = {
  clearAllFilters,
  clearQuery,
  clearPolygon,
};

describe('TableEmpty', () => {
  beforeEach(() => {
    (useSearchPhrase as jest.Mock).mockImplementation(constant(''));
    (useGetTypeFromGeometry as jest.Mock).mockImplementation(constant(null));
    (useWellSearchResultQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
    }));
  });
  afterEach(() => {
    (useSearchPhrase as jest.Mock).mockClear();
    (useGetTypeFromGeometry as jest.Mock).mockClear();
    (useWellSearchResultQuery as jest.Mock).mockClear();
  });

  const store = getMockedStore();

  const testInit = async (viewProps?: TableEmptyProps) =>
    testRenderer(TableEmpty, store, viewProps);

  it('should render no results text', async () => {
    await testInit(defaultProps);

    expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();
  });

  it(`should trigger callbacks and actions on clear filters`, async () => {
    const clearAllFiltersSpy = jest
      .spyOn(mapActions, 'clearSelectedFeature')
      .mockImplementation(() => ({ type: '' }));

    await testInit(defaultProps);
    const button = screen.getByTestId('clear-all-btn');
    fireEvent.click(button);
    expect(clearAllFilters).toBeCalledTimes(1);
    expect(clearAllFiltersSpy).toBeCalledTimes(1);
  });
});
