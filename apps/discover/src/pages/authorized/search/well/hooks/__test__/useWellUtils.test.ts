import { renderHook } from '@testing-library/react-hooks';

import { METER } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';

import { useWellResultColumns } from '../useWellUtils';

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
      useWellResultColumns()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return well result head object with preferred unit', async () => {
    const wellResultHeads = await getHookResult();

    expect(wellResultHeads.waterDepth.Header).toContain(METER);
  });
});
