import { screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { getMockWellsGeometry } from '__mocks/mockWellsGeometry';
import { getMockDocument } from '__test-utils/fixtures/document';
import {
  getMockGeometry,
  getMockPointGeo,
} from '__test-utils/fixtures/geometry';
import { getWrapper, testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useDocumentResultHits } from 'modules/documentSearch/hooks/useDocumentResultHits';
import {
  ExternalWellsFeature,
  useDataFeatures,
} from 'modules/map/hooks/useDataFeatures';
import {
  DOCUMENT_LAYER_ID,
  WELL_HEADS_LAYER_ID,
} from 'pages/authorized/search/map/constants';

jest.mock('modules/documentSearch/hooks/useDocumentResultHits', () => ({
  useDocumentResultHits: jest.fn(),
}));

jest.mock('modules/wellSearch/hooks/useWellQueryResultSelectors', () => ({
  useWellQueryResultWells: jest.fn(),
}));

const selectedLayers = [WELL_HEADS_LAYER_ID, DOCUMENT_LAYER_ID];

const mockServer = setupServer(getMockWellsGeometry());

describe('useDataFeatures', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  beforeEach(() => {
    (useDocumentResultHits as jest.Mock).mockImplementation(() => [
      getMockDocument({ id: '1', geolocation: getMockGeometry() }),
      getMockDocument({ id: '2' }),
    ]);
  });

  it('should return empty array for empty state', async () => {
    (useDocumentResultHits as jest.Mock).mockImplementation(() => []);
    const store = getMockedStore();

    const { result } = renderHook(() => useDataFeatures(selectedLayers, []), {
      wrapper: getWrapper(store),
    });

    expect(result.current.features).toHaveLength(0);
  });

  it('should return empty array for documents and wells without geolocation', async () => {
    (useDocumentResultHits as jest.Mock).mockImplementation(() => [
      getMockDocument({ id: '1' }),
      getMockDocument({ id: '2' }),
    ]);

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
          {data?.features.map((well, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <button type="button" key={index}>
              {well.id || well?.properties?.id || 'Empty'}
            </button>
          ))}
        </>
      );
    };

    testRenderer(TestComponent, store);

    expect(
      await screen.findByRole('button', { name: /123/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /well-collection-1/ })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /Empty/i })
    ).toBeInTheDocument();
    expect(await (await screen.findAllByRole('button')).length).toEqual(3);
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
          id: 124,
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
          id: 123,
        },
      },
    ];

    const store = getMockedStore({
      documentSearch: {
        selectedDocumentIds: ['1', '2'],
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

    testRenderer(TestComponent, store);

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
    expect(
      await screen.findByRole('button', {
        name: /well-collection-1:false:true/,
      })
    ).toBeInTheDocument();
  });

  it('should remove external wells that have same id as wells from results', async () => {
    const externalWells: ExternalWellsFeature[] = [
      {
        id: 123,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 1,
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
          {data?.features.map((well) => (
            <button type="button" key={`id-${well.id || well?.properties?.id}`}>
              {well.id || well?.properties?.id}
            </button>
          ))}
        </>
      );
    };

    testRenderer(TestComponent, store);

    expect((await screen.findAllByRole('button')).length).toEqual(2);
  });
});
