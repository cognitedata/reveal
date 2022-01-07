import { renderHook } from '@testing-library/react-hooks';

import { mockedWellsFixtureWellbores } from '__test-utils/fixtures/well';

import { useMapToColoredWellbore } from '../useMapToColoredWellbore';

describe('useMapToColoredWellbore', () => {
  const getHookResult = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useMapToColoredWellbore()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return wellbores with colors', () => {
    const toColoredWellbore = getHookResult();
    const coloredWellbores = mockedWellsFixtureWellbores.map(toColoredWellbore);

    coloredWellbores.forEach((wellbore) => {
      expect(wellbore.metadata?.color).toBeTruthy();
    });
  });
});
