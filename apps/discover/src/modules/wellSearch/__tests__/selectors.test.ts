import { useSelector } from 'react-redux';

import { cleanup } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import noop from 'lodash/noop';

import {
  getMockWell,
  mockedWellboreResultFixture,
  mockedWellStateWithSelectedWells,
} from '__test-utils/fixtures/well';

import { useWellQueryResultWells } from '../hooks/useWellQueryResultSelectors';
import {
  useWells,
  useSelectedWellboreIds,
  useWellboreData,
  useExternalLinkFromSelectedWells,
  useIndeterminateWells,
} from '../selectors';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('../hooks/useWellQueryResultSelectors', () => ({
  useWellQueryResultWells: jest.fn(),
}));

const mockExternalLink = jest.fn();

describe('Well Selectors', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(mockedWellStateWithSelectedWells);
    });
  });

  afterEach(() => {
    (useSelector as jest.Mock).mockClear();
    cleanup();
  });

  it(`should return well search state`, () => {
    expect(useWells()).toEqual(mockedWellStateWithSelectedWells.wellSearch);
  });

  it(`should return selected wellbores ids as a list`, () => {
    const { result } = renderHook(() => useSelectedWellboreIds());
    const wellboreIds = result.current;
    expect(wellboreIds).toEqual(['759155409324993']);
  });

  it(`should return wellbore data`, () => {
    const { result } = renderHook(() => useWellboreData());
    expect(result.current).toEqual(
      mockedWellStateWithSelectedWells.wellSearch.wellboreData
    );
  });

  it(`should return indeterminate wells (Wells that some of its wellbores are selected)`, async () => {
    (useWellQueryResultWells as jest.Mock).mockImplementation(() => [
      getMockWell(),
      getMockWell({ wellbores: mockedWellboreResultFixture }),
    ]);
    const { result } = renderHook(() => useIndeterminateWells());
    expect(result.current).toEqual({ 1234: true });
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return empty array based on selected wells metadata and tenantConfig', async () => {
    mockExternalLink.mockImplementation(() => ({
      test: (items: string) => `test ${items}`,
    }));
    const { result } = renderHook(() => useExternalLinkFromSelectedWells());
    act(() => noop());

    expect(result.current).toEqual([]);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return correct link based on selected wells metadata and tenantConfig', async () => {
    mockExternalLink.mockImplementation(() => ({
      productionDataLink: (items: string) => `This is some link ${items}`,
    }));
    const { result } = renderHook(() => useExternalLinkFromSelectedWells());
    act(() => noop());

    expect(result.current).toEqual(['This is some link Well 1']);
  });
  // disabled for now until the well data comes
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return correct links based on selected wells metadata and tenantConfig', () => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback({
        ...mockedWellStateWithSelectedWells,
        wellSearch: {
          ...mockedWellStateWithSelectedWells.wellSearch,
          selectedWellIds: { 252284653: true, 234784653: true },
        },
      });
    });

    mockExternalLink.mockImplementation(() => ({
      productionDataLink: (items: string) => `This is some link ${items}`,
      wellDataLink: (items: string) => `This is another link ${items}`,
    }));
    const { result } = renderHook(() => useExternalLinkFromSelectedWells());
    act(() => noop());

    expect(result.current).toEqual([
      'This is some link Well 1,Well 2',
      'This is another link Well 1',
    ]);
  });
});
