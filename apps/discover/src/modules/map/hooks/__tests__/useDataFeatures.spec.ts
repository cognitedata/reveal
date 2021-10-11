import { renderHook } from '@testing-library/react-hooks';

import { getMockDocument } from '__test-utils/fixtures/document';
import {
  getMockGeometry,
  getMockPointGeo,
} from '__test-utils/fixtures/geometry';
import { getMockWellOld } from '__test-utils/fixtures/well';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  ExternalWellsFeature,
  useDataFeatures,
} from 'modules/map/hooks/useDataFeatures';
import {
  DOCUMENT_LAYER_ID,
  WELL_HEADS_LAYER_ID,
} from 'pages/authorized/search/map/constants';

const selectedLayers = [WELL_HEADS_LAYER_ID, DOCUMENT_LAYER_ID];

describe('useDataFeatures', () => {
  it('should return empty array for empty state', async () => {
    const store = getMockedStore();
    const { result } = renderHook(() => useDataFeatures(selectedLayers, []), {
      wrapper: ({ children }) => testWrapper({ store, children }),
    });
    expect(result.current.features).toHaveLength(0);
  });

  it('should return empty array for documents and wells without geolocation', async () => {
    const store = getMockedStore({
      documentSearch: {
        result: {
          hits: [getMockDocument({ id: '1' }), getMockDocument({ id: '2' })],
        },
        selectedDocumentIds: ['1', '2'],
      },
      wellSearch: {
        wells: [getMockWellOld({ id: 1 })],
        selectedWellIds: {
          1: true,
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures(selectedLayers, []),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );

    waitForNextUpdate();

    expect(result.current.features).toHaveLength(0);
  });

  it('should return correct data for documents and wells that have geolocation', async () => {
    const store = getMockedStore({
      documentSearch: {
        result: {
          hits: [
            getMockDocument({ id: '1', geolocation: getMockGeometry() }),
            getMockDocument({ id: '2' }),
          ],
        },
        selectedDocumentIds: ['1', '2'],
      },
      wellSearch: {
        wells: [getMockWellOld({ id: 1, geometry: getMockPointGeo() })],
        selectedWellIds: {
          1: true,
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures(selectedLayers, []),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );

    waitForNextUpdate();

    expect(result.current.features).toHaveLength(2);
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
      documentSearch: {
        result: {
          hits: [
            getMockDocument({ id: '1', geolocation: getMockGeometry() }),
            getMockDocument({ id: '2' }),
          ],
        },
        selectedDocumentIds: ['1', '2'],
      },
      wellSearch: {
        wells: [getMockWellOld({ id: 1, geometry: getMockPointGeo() })],
        selectedWellIds: {
          1: true,
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures(selectedLayers, externalWells),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );

    waitForNextUpdate();

    expect(result.current.features).toHaveLength(3);
    expect(result.current.features[2].id).toEqual(123);
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
      documentSearch: {
        result: {
          hits: [
            getMockDocument({ id: '1', geolocation: getMockGeometry() }),
            getMockDocument({ id: '2' }),
          ],
        },
        selectedDocumentIds: ['1', '2'],
      },
      wellSearch: {
        wells: [getMockWellOld({ id: 1, geometry: getMockPointGeo() })],
        selectedWellIds: {
          1: true,
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures([], externalWells),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
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
        result: {
          hits: [
            getMockDocument({ id: '1', geolocation: getMockGeometry() }),
            getMockDocument({ id: '2' }),
          ],
        },
        selectedDocumentIds: ['1', '2'],
      },
      wellSearch: {
        wells: [getMockWellOld({ id: 1, geometry: getMockPointGeo() })],
        selectedWellIds: {
          1: false,
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures(selectedLayers, externalWells),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );

    waitForNextUpdate();

    // documents is selected so isblurred is false
    expect(result.current.features[0].properties?.isSelected).toEqual('true');
    expect(result.current.features[0].properties?.isBlurred).toBeFalsy();

    // well should have isBlurred true since its not selected and there are documents selected
    expect(result.current.features[1].properties?.isSelected).toEqual('false');
    expect(result.current.features[1].properties?.isBlurred).toBeTruthy();

    // remote well heads are cannot be selected and they are blurred if any document or well is selected
    expect(result.current.features[2].properties?.isSelected).toEqual('false');
    expect(result.current.features[2].properties?.isBlurred).toBeTruthy();
  });

  it('should remove external wells that have same id as wells from results', () => {
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
      documentSearch: {
        result: {
          hits: [
            getMockDocument({ id: '1', geolocation: getMockGeometry() }),
            getMockDocument({ id: '2' }),
          ],
        },
        selectedDocumentIds: ['1', '2'],
      },
      wellSearch: {
        wells: [getMockWellOld({ id: 1, geometry: getMockPointGeo() })],
        selectedWellIds: {
          1: true,
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures(selectedLayers, externalWells),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );

    waitForNextUpdate();

    expect(result.current.features).toHaveLength(2);
  });
});
