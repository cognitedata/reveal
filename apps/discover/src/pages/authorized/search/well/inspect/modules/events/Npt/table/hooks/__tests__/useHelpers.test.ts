import { renderHook } from '@testing-library/react-hooks';

import { METER } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import {
  useNptTableCommonHeaders,
  useNptWellboresTableColumns,
  useNptEventsTableColumns,
} from '../useHelpers';

jest.mock('hooks/useUserPreferences', () => ({
  useUserPreferencesMeasurement: jest.fn(),
}));

describe('useNptTableCommonHeaders hook', () => {
  beforeEach(() => {
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(
      () => METER
    );
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
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(
      () => METER
    );
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
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(
      () => METER
    );
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
