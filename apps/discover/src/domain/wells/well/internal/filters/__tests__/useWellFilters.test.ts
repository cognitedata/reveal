import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import {
  getMockSidebarState,
  getMockAppliedFiltersType,
} from '__test-utils/fixtures/sidebar';
import { getWrapper, testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { FilterIDs } from 'modules/wellSearch/constants';

import { DATA_AVAILABILITY_OPTIONS_LABELS } from '../getDataAvailabilityFilter';
import { useWellFilters } from '../useWellFilters';

// mocking this because when rendering the hook useWellFilters (this test file)
// it is not waiting for it to resolve before running the test
jest.mock('hooks/useUserPreferences', () => {
  return {
    useUserPreferencesMeasurement: () => ({ data: 'f' }),
  };
});

const mockServer = setupServer(getMockUserMe());

describe('useWellFilters', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should be ok empty', () => {
    const { result } = renderHook(() => useWellFilters(), {
      wrapper: testWrapper,
    });
    expect(result.current).toEqual({});
  });

  it('should pickup filters from state', () => {
    const store = getMockedStore({
      sidebar: getMockSidebarState({
        appliedFilters: getMockAppliedFiltersType(
          {},
          {
            [FilterIDs.NDS_RISKS_TYPE]: ['Casing'],
          }
        ),
      }),
    });

    const { result } = renderHook(() => useWellFilters(), {
      wrapper: getWrapper(store),
    });

    expect(result.current).toEqual({
      nds: { riskTypes: { containsAny: ['Casing'] }, exists: true },
      operator: { isSet: true, oneOf: ['Atlantis', 'Mad Dog'] },
      field: { isSet: true, oneOf: ['BOEM', 'BP-Penquin'] },
    });
  });

  test('data availability does not override other settings', () => {
    const store = getMockedStore({
      sidebar: getMockSidebarState({
        appliedFilters: getMockAppliedFiltersType(
          {},
          {
            [FilterIDs.NDS_RISKS_TYPE]: ['Casing'],
            [FilterIDs.DATA_AVAILABILITY]: [
              DATA_AVAILABILITY_OPTIONS_LABELS.NDS,
            ],
          }
        ),
      }),
    });

    const { result } = renderHook(() => useWellFilters(), {
      wrapper: getWrapper(store),
    });

    expect(result.current).toEqual({
      nds: { riskTypes: { containsAny: ['Casing'] }, exists: true },
      operator: { isSet: true, oneOf: ['Atlantis', 'Mad Dog'] },
      field: { isSet: true, oneOf: ['BOEM', 'BP-Penquin'] },
    });
  });
});
