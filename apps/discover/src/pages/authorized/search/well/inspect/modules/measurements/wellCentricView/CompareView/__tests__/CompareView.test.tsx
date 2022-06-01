import '__mocks/mockContainerAuth'; // should be first
import 'services/wellSearch/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { screen, waitFor } from '@testing-library/react';
import { getWellboreTitle } from 'dataLayers/wells/wellbores/decorators/getWellboreTitle';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import {
  getMockDepthMeasurements,
  getMockDepthMeasurementData,
} from 'services/well/measurements/__mocks/mockMeasurements';
import { getMockWellsById } from 'services/wellSearch/__mocks/getMockWellsById';

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
