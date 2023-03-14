import { useTransformationsFeatureFlag } from './useTransformations';
import { useFlag } from '../../environments/useFlag';

jest.mock('../../environments/useFlag');

const mockedUseFlag = jest.mocked(useFlag);

describe('useTransformationsFeatureFlag', () => {
  it('returns false if feature flag is disabled', () => {
    mockedUseFlag.mockReturnValue({
      isEnabled: false,
      isClientReady: undefined,
    });

    const isEnabled = useTransformationsFeatureFlag();

    expect(isEnabled).toBe(false);
  });

  it('returns true if feature flag is enabled', () => {
    mockedUseFlag.mockReturnValue({
      isEnabled: true,
      isClientReady: undefined,
    });

    const isEnabled = useTransformationsFeatureFlag();

    expect(isEnabled).toBe(true);
  });
});
