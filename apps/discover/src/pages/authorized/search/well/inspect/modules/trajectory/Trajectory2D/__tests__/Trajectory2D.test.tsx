import { act } from 'react-test-renderer';

import { screen } from '@testing-library/react';

import { mockedTrajectoryData } from '__test-utils/fixtures/trajectory';
import { testRenderer } from '__test-utils/renderer';

import { Trajectory2D, Props } from '../Trajectory2D';

jest.mock(
  '../../../../../../../../../modules/wellSearch/hooks/useWellConfig',
  () => ({
    useWellConfig: () => ({
      data: {},
    }),
  })
);

describe('Trajectory2D', () => {
  const defaultTestInit = async (props?: Props) =>
    testRenderer(Trajectory2D, undefined, props);

  it(`should press enter`, async () => {
    await act(async () => {
      await defaultTestInit({
        selectedTrajectoryData: mockedTrajectoryData,
        selectedTrajectories: [],
        selectedWellbores: [],
        showWellWellboreDropdown: true,
      });

      expect(screen.getAllByTestId('wellbore-dropdown').length).toBeGreaterThan(
        0
      );
    });
  });
});
