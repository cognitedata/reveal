import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { getMockConfigGet } from '__mocks/getMockConfigGet';
import { getMockedTrajectoryData } from '__test-utils/fixtures/trajectory';
import { testRenderer } from '__test-utils/renderer';

import { Trajectory2D, Props } from '../Trajectory2D';

const mockServer = setupServer(getMockConfigGet());

describe('Trajectory2D', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const defaultTestInit = async (props?: Props) =>
    testRenderer(Trajectory2D, undefined, props);

  // SKIPPED: Test is checking for results in dropdown; however, the wellbore dropdown is removed from the trajectory page
  // (since we are using the sidebar for wellbores now).
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip(`should render default view`, async () => {
    await defaultTestInit({
      selectedTrajectoryData: getMockedTrajectoryData(),
      selectedTrajectories: [],
      selectedWellbores: [],
    });

    const results = await screen.findAllByTestId('wellbore-dropdown');
    expect(results.length).toBeGreaterThan(0);
  });
});
