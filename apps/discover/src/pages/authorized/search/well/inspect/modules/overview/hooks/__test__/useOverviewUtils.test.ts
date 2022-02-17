import { renderHook } from '@testing-library/react-hooks';

import { METER } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { useOverviewResultColumns } from '../useOverviewUtils';

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
      useOverviewResultColumns()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return well result head object with preferred unit', async () => {
    const overViewHeaders = await getHookResult();

    expect(overViewHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'Water depth (m)' }),
      ])
    );
  });
});
