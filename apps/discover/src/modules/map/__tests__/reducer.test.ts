import { getMockGeometry } from '__test-utils/fixtures/geometry';
import { getMapSource } from '__test-utils/fixtures/map';

import { map, initialState } from '../reducer';
import { Asset } from '../types';
import {
  SET_OTHER_SHOWING_GEO,
  SET_GEO_FILTERS,
  REMOVE_LAYER,
  SET_ASSETS,
  SET_SOURCES,
  PATCH_SOURCE,
} from '../types.actions';

import { getMockGeo } from './utils';

describe('map.reducer', () => {
  test(`${REMOVE_LAYER}`, () => {
    const state = map(
      {
        ...initialState,
        selectedLayers: ['a', 'b'],
      },
      {
        type: REMOVE_LAYER,
        id: 'a',
      }
    );
    expect(state.selectedLayers).toEqual(['b']);
  });

  test(`${SET_GEO_FILTERS}`, () => {
    const geo1 = getMockGeo();
    const state = map(undefined, {
      type: SET_GEO_FILTERS,
      geoFilter: [geo1],
    });
    expect(state.geoFilter).toEqual([geo1]);
  });

  describe(`${SET_OTHER_SHOWING_GEO}`, () => {
    test(`add`, () => {
      const state = map(undefined, {
        type: SET_OTHER_SHOWING_GEO,
        id: '1',
        geometry: getMockGeometry(),
      });
      expect(state.otherGeo).toEqual({
        '1': getMockGeometry(),
      });
    });
    test(`add two`, () => {
      const state = map(undefined, {
        type: SET_OTHER_SHOWING_GEO,
        id: '1',
        geometry: getMockGeometry(),
      });
      const updatedState = map(state, {
        type: SET_OTHER_SHOWING_GEO,
        id: '2',
        geometry: getMockGeometry(),
      });
      expect(updatedState.otherGeo).toMatchObject({
        '1': getMockGeometry(),
        '2': getMockGeometry(),
      });
    });
    test(`remove`, () => {
      const state = map(undefined, {
        type: SET_OTHER_SHOWING_GEO,
        id: '1',
        geometry: getMockGeometry(),
      });
      const updatedState = map(state, {
        type: SET_OTHER_SHOWING_GEO,
        id: '1',
        geometry: getMockGeometry(),
      });
      expect(updatedState.otherGeo).toEqual({});
    });

    test('Should patch map assets', () => {
      const assets: Asset[] = [
        {
          name: 'Asset 1',
          geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
        },
      ];
      const state = map(undefined, {
        type: SET_ASSETS,
        assets,
      });
      expect(state.assets).toEqual(assets);
    });

    test('Should set map sources', () => {
      const sources = [
        {
          id: '1',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                geometry: { type: 'Polygon', coordinates: [0, 0] },
                type: 'Feature',
              },
            ],
          },
        },
      ];
      const state = map(undefined, {
        type: SET_SOURCES,
        sources,
      });
      expect(state.sources).toEqual(sources);
    });

    test('Should patch map source', () => {
      const wellHeadSource = {
        id: 'Well_Heads',
        data: {},
      };

      const source = {
        id: 'Well_Heads',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              geometry: { type: 'Polygon', coordinates: [0, 0] },
              type: 'Feature',
            },
          ],
        },
      };

      const state = map(
        {
          sources: [wellHeadSource, ...getMapSource()],
          assets: [],
          geoFilter: [],
          arbitraryLine: null,
          drawMode: 'direct_select',
          filterApplied: false,
          otherGeo: {},
          selectedFeature: null,
          selectedLayers: [],
        },
        {
          type: PATCH_SOURCE,
          source,
        }
      );
      expect(state.sources).toEqual([source, ...getMapSource()]);
    });
  });
});
