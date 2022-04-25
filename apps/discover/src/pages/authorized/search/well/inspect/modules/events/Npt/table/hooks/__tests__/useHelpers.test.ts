import { renderHook } from '@testing-library/react-hooks';

import { METER } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import {
  useNptTableCommonHeaders,
  useNptWellboresTableColumns,
  useNptEventsTableColumns,
  useSelectedWellboreNptEventsTableColumns,
} from '../useHelpers';

jest.mock('hooks/useUserPreferences', () => ({
  useUserPreferencesMeasurement: jest.fn(),
}));

// Mocked for now, needs to be replaced with network mock
jest.mock('services/well/legend/npt/useNptLegendQuery', () => ({
  useNptLegendCodeQuery: () => {
    return {
      data: [],
    };
  },
}));

describe('useNptTableCommonHeaders hook', () => {
  beforeEach(() => {
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: METER,
    }));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNptTableCommonHeaders()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return well result head object with preferred unit', async () => {
    const ndsColumnHeaders = await getHookResult();
    expect(ndsColumnHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'NPT MD (m)' }),
      ])
    );
  });
});

describe('useNptWellboresTableColumns hook', () => {
  beforeEach(() => {
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: METER,
    }));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNptWellboresTableColumns()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return well result head object with preferred unit', async () => {
    const ndsColumnHeaders = await getHookResult();
    expect(ndsColumnHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'NPT MD (m)' }),
      ])
    );
  });
});

describe('useNptEventsTableColumns hook', () => {
  beforeEach(() => {
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: METER,
    }));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNptEventsTableColumns()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return well result head object with preferred unit', async () => {
    const ndsColumnHeaders = await getHookResult();
    expect(ndsColumnHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'NPT MD (m)' }),
      ])
    );
  });
});

describe('useSelectedWellboreNptEventsTableColumns hook', () => {
  beforeEach(() => {
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: METER,
    }));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSelectedWellboreNptEventsTableColumns()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return npt codes and description columns as expected', async () => {
    const ndsColumnHeaders = await getHookResult();
    expect(ndsColumnHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'NPT Code' }),
        expect.objectContaining({ Header: 'Description' }),
      ])
    );
  });
});
