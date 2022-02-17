import { renderHook } from '@testing-library/react-hooks';

import { METER } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { useGetNdsTableColumns } from '../useHelpers';

jest.mock('hooks/useUserPreferences', () => ({
  useUserPreferencesMeasurement: jest.fn(),
}));

describe('useWellResultColumns hook', () => {
  beforeEach(() => {
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: METER,
    }));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGetNdsTableColumns()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return well result head object with preferred unit', async () => {
    const ndsColumnHeaders = await getHookResult();
    expect(ndsColumnHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'MD Hole Start (m)' }),
        expect.objectContaining({ Header: 'MD Hole End (m)' }),
      ])
    );
  });
});
