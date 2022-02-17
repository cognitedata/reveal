import { renderHook } from '@testing-library/react-hooks';

import { METER } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { useGetCasingTableColumns } from '../useHelpers';

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
      useGetCasingTableColumns()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return well result head object with preferred unit', async () => {
    const ndsColumnHeaders = await getHookResult();
    expect(ndsColumnHeaders.casingsTableColumn).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'Top MD (m)' }),
        expect.objectContaining({ Header: 'Bottom MD (m)' }),
      ])
    );
  });
});
