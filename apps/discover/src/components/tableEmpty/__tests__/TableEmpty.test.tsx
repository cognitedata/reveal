import { screen, act, fireEvent } from '@testing-library/react';
import constant from 'lodash/constant';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { NO_RESULTS_TEXT } from 'components/emptyState/constants';
import * as mapActions from 'modules/map/actions';
import { useGetTypeFromGeometry } from 'modules/map/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';
import { useWells } from 'modules/wellSearch/selectors';

import { TableEmpty, TableEmptyProps } from '../TableEmpty';

jest.mock('modules/wellSearch/selectors', () => ({
  useWells: jest.fn(),
}));

jest.mock('modules/sidebar/selectors', () => ({
  useSearchPhrase: jest.fn(),
}));

jest.mock('modules/map/selectors', () => ({
  useGetTypeFromGeometry: jest.fn(),
}));
jest.mock('components/tableEmpty/FilterCategoryValues', () => ({
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
    (useWells as jest.Mock).mockImplementation(() => ({ isSearching: false }));
    (useSearchPhrase as jest.Mock).mockImplementation(constant(''));
    (useGetTypeFromGeometry as jest.Mock).mockImplementation(constant(null));
  });
  afterEach(() => {
    (useWells as jest.Mock).mockClear();
    (useSearchPhrase as jest.Mock).mockClear();
    (useGetTypeFromGeometry as jest.Mock).mockClear();
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

    await act(async () => {
      await testInit(defaultProps);
      const button = screen.getByTestId('clear-all-btn');
      fireEvent.click(button);
      expect(clearAllFilters).toBeCalledTimes(1);
      expect(clearAllFiltersSpy).toBeCalledTimes(1);
    });
  });
});
