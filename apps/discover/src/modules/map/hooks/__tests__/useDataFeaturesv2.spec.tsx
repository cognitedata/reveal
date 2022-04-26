import '__mocks/mockCogniteSDK';
import 'services/wellSearch/__mocks/setupWellsMockSDK';

import { screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsGeometry } from 'services/well/__mocks/getMockWellsGeometry';
import { getMockWellsById } from 'services/wellSearch/__mocks/getMockWellsById';
import { getMockWellsSearch } from 'services/wellSearch/__mocks/getMockWellsSearch';

import { getMockPointGeo } from '__test-utils/fixtures/geometry';
import { getMockWell } from '__test-utils/fixtures/well/well';
import { getWrapper, testRenderer } from '__test-utils/renderer';
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

describe('useDataFeatures', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return empty array for empty state', async () => {
    const store = getMockedStore();

    const { result } = renderHook(() => useDataFeatures(selectedLayers, []), {
      wrapper: getWrapper(store),
    });

    expect(result.current.features).toHaveLength(0);
  });

  it('should return empty array for documents and wells without geolocation', async () => {
    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures(selectedLayers, []),
      {
        wrapper: getWrapper(store),
      }
    );
    waitForNextUpdate();

    expect(result.current.features).toHaveLength(0);
  });

  it('should return correct data for documents and wells that have geolocation', async () => {
    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, []);
      return <div>Total: {data.features.length}</div>;
    };

    testRenderer(TestComponent, store);

    expect(await screen.findByText('Total: 2')).toBeInTheDocument();
  });

  it('should return correct data from state and remote wells', async () => {
    const externalWells: ExternalWellsFeature[] = [
      {
        id: 123,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 123454,
        },
      },
    ];

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, externalWells);
      return (
        <>
          {data?.features.map((well) => {
            const key = well.id || well?.properties?.id || 'Empty';
            return (
              <button type="button" key={key}>
                {key}
              </button>
            );
          })}
        </>
      );
    };

    testRenderer(TestComponent, store);

    expect(
      await screen.findByRole('button', { name: /123/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: mockWell.matchingId })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /Empty/i })
    ).toBeInTheDocument();
  });

  it('should return empty array when no layers are selected based on data from state and remote wells', async () => {
    const externalWells: ExternalWellsFeature[] = [
      {
        id: 123,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: mockWell.matchingId,
        },
      },
    ];

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures([], externalWells),
      {
        wrapper: getWrapper(store),
      }
    );

    waitForNextUpdate();

    expect(result.current.features).toHaveLength(0);
  });

  it('should set isBlurred and isSelected properties correctly', async () => {
    const externalWells: ExternalWellsFeature[] = [
      {
        id: 123,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: mockWell.matchingId,
        },
      },
    ];

    const store = getMockedStore({
      documentSearch: {
        selectedDocumentIds: ['123', '2'],
      },
      wellSearch: {
        selectedWellIds: {
          1: false,
        },
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, externalWells);
      return (
        <>
          {data?.features.map((well) => {
            const id = `${well.id || well?.properties?.id}:${
              well.properties?.isSelected
            }:${well.properties?.isBlurred}`;
            return (
              <button type="button" key={id}>
                {id}
              </button>
            );
          })}
        </>
      );
    };

    await testRenderer(TestComponent, store);

    // documents is selected so isblurred is false
    expect(
      await screen.findByRole('button', { name: /:true:false/ })
    ).toBeInTheDocument();

    // well should have isBlurred true since its not selected and there are documents selected
    expect(
      await screen.findByRole('button', {
        name: /123:false:true/,
      })
    ).toBeInTheDocument();

    // remote well heads are cannot be selected and they are blurred if any document or well is selected
    const name = `${mockWell.matchingId}:false:true`;

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name,
        })
      ).toBeInTheDocument();
    });
  });

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
