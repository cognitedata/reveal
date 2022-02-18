import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsById } from 'services/well/__mocks/getMockWellsById';
import { getMockTrajectoriesList } from 'services/well/__mocks/getMockWellTrajectories';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useOverviewData } from '../useOverviewData';

jest.mock('modules/wellSearch/hooks/useEnabledWellSdkV3', () => ({
  useEnabledWellSdkV3: () => true,
}));

const mockServer = setupServer(
  getMockConfigGet(),
  getMockUserMe(),
  getMockTrajectoriesList(),
  getMockWellsById()
);

describe('Overview hook', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('load overview data', async () => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
    });

    const TestComponent: React.FC = () => {
      const { overviewData, isLoading } = useOverviewData();

      if (isLoading && !overviewData.length) {
        return <div>Loading...</div>;
      }

      const [data] = overviewData;

      return (
        <section>
          <div>Name: {data?.name}</div>
          <div>Water-depth: {data?.waterDepth?.value}</div>
          <div>MD: {data?.md}</div>
          <div>TVD: {data?.tvd}</div>
        </section>
      );
    };

    testRenderer(TestComponent, store);

    const name = await screen.findByText('Name: wellbore B');
    expect(name).toBeInTheDocument();

    const waterDepth = await screen.findByText('Water-depth: 10.00');
    expect(waterDepth).toBeInTheDocument();

    const md = await screen.findByText('MD: 41.00');
    expect(md).toBeInTheDocument();

    const tvd = await screen.findByText('TVD: 32.00');
    expect(tvd).toBeInTheDocument();
  });
});
