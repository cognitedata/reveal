import '__mocks/mockContainerAuth'; // should be first
import 'domain/wells/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockDepthMeasurementData } from 'domain/wells/measurements/service/__mocks/getMockDepthMeasurementData';
import { getMockDepthMeasurements } from 'domain/wells/measurements/service/__mocks/getMockDepthMeasurements';
import { getMockWellsById } from 'domain/wells/well/service/__mocks/getMockWellsById';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';
import { getWellboreTitle } from 'domain/wells/wellbore/internal/selectors/getWellboreTitle';

import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { CompareView, Props } from '../CompareView';

describe('Measurement with delayed loading and no data', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(0),
    getMockDepthMeasurementData(0),
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById()
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = (props: Props) => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
    });
    return testRenderer(CompareView, store, props);
  };

  it('Should render plot for selected well and wellbore', async () => {
    const wellbore = getMockWellbore({
      id: 'test-well-1',
    });
    page({
      wellbores: [wellbore],
      onBack: jest.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText(/FP_CARBONATE_ML/)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`${getWellboreTitle(wellbore)}`, 'g'))
      ).toBeInTheDocument();
    });
  });
});
