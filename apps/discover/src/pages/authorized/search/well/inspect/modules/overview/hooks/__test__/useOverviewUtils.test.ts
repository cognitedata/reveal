import { renderHook } from '@testing-library/react-hooks';

import { METER } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';

import { useOverviewResultColumns } from '../useOverviewUtils';

jest.mock('hooks/useUserPreference', () => ({
  useUserPreferencesMeasurement: jest.fn(),
}));

describe('useWellResultColumns hook', () => {
  beforeEach(() => {
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(
      () => METER
    );
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
        expect.objectContaining({ Header: 'TVD (m)' }),
        expect.objectContaining({ Header: 'MD (m)' }),
        expect.objectContaining({ Header: 'Water depth (m)' }),
      ])
    );
  });
});
