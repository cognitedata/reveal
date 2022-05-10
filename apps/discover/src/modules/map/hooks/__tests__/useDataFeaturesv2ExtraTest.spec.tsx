import '__mocks/mockCogniteSDK';
import 'services/wellSearch/__mocks/setupWellsMockSDK';

import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsGeometry } from 'services/well/__mocks/getMockWellsGeometry';
import { getMockWellsById } from 'services/wellSearch/__mocks/getMockWellsById';
import { getMockWellsSearch } from 'services/wellSearch/__mocks/getMockWellsSearch';

import { getMockPointGeo } from '__test-utils/fixtures/geometry';
import { getMockWell } from '__test-utils/fixtures/well/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  ExternalWellsFeature,
  useDataFeatures,
} from 'modules/map/hooks/useDataFeaturesv2';
import {
  DOCUMENT_LAYER_ID,
  WELL_HEADS_LAYER_ID,
} from 'pages/authorized/search/map/constants';

const selectedLayers = [WELL_HEADS_LAYER_ID, DOCUMENT_LAYER_ID];

jest.mock('modules/wellSearch/hooks/useEnabledWellSdkV3', () => ({
  useEnabledWellSdkV3: () => true,
}));

const mockServer = setupServer(
  getMockUserMe(),
  getMockWellsGeometry(),
  getMockDocumentSearch(),
  getMockWellsSearch(),
  getMockWellsById(),
  getMockConfigGet()
);

const mockWell = getMockWell();
/**
 * This test file has been made because this test often fails in CI due to timeout
 * hoping to split it into it's own file to perhaps allow it to run with less load
 */
describe('useDataFeatures', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should remove external wells that have same id as wells from results', async () => {
    const externalWells: ExternalWellsFeature[] = [
      {
        id: 111,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 111,
        },
      },
      {
        id: 222,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 222,
        },
      },
    ];

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {},
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, externalWells);
      // console.log('data', JSON.stringify(data, null, 2));
      return (
        <>
          {data?.features.map((well) => (
            <button type="button" key={`id-${well.id || well?.properties?.id}`}>
              {well.id || well?.properties?.id}
            </button>
          ))}
        </>
      );
    };

    await testRenderer(TestComponent, store);

    /**
     * The reason we use the waitFor here explicitly is because of the high number of re-rendering
     * causing sporadic unit-test fails. Generally we should use screen.findBy....
     * */
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: mockWell.matchingId,
        })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      // NOTE: i suspect there is something wrong here
      // this is not showing 444 but i think it should
      expect(screen.getAllByRole('button').length).toEqual(4);
    });
  });
});
