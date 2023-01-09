import { useTransformationsFeatureFlag } from './useTransformations';
import { useFlag } from '../../environments/useFlag';
import { isFDMv3 } from './isFDMv3';

jest.mock('../../environments/useFlag');
jest.mock('./isFDMv3');

const mockedUseFlag = jest.mocked(useFlag);
const mockedisFDMv3 = jest.mocked(isFDMv3);

describe('useTransformationsFeatureFlag', () => {
  it('returns false if feature flag is disabled', () => {
    mockedUseFlag.mockReturnValue({
      isEnabled: false,
      isClientReady: undefined,
    });

    const isEnabled = useTransformationsFeatureFlag();

    expect(isEnabled).toBe(false);
  });

  it('returns false if feature flag is enabled and DMS V3 is enabled', () => {
    mockedUseFlag.mockReturnValue({
      isEnabled: true,
      isClientReady: undefined,
    });
    mockedisFDMv3.mockReturnValue(true);

    const isEnabled = useTransformationsFeatureFlag();

    expect(isEnabled).toBe(false);
  });

  it('returns true if feature flag is enabled and DMS V3 is disabled', () => {
    mockedUseFlag.mockReturnValue({
      isEnabled: true,
      isClientReady: undefined,
    });
    mockedisFDMv3.mockReturnValue(false);

    const isEnabled = useTransformationsFeatureFlag();

    expect(isEnabled).toBe(true);
  });
});
