import { getMockedStore } from '__test-utils/store.utils';
import {
  patchSource,
  setAssets,
  setGeo,
  setSources,
} from 'modules/map/actions';
import {
  PATCH_SOURCE,
  SET_ASSETS,
  SET_GEO_FILTERS,
  SET_SOURCES,
} from 'modules/map/types.actions';

import { Asset } from '../types';

import { getMockGeo } from './utils';

describe('Map Actions', () => {
  it(`creates ${SET_GEO_FILTERS} when changing the geo filter`, () => {
    const geo1 = getMockGeo();
    const expectedActions = [{ type: SET_GEO_FILTERS, geoFilter: [geo1] }];
    const store = getMockedStore();

    store.dispatch(setGeo([geo1]));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`Set polygon filter applied when search by polygon`, () => {
    const geo1 = getMockGeo();
    const expectedActions = [
      { type: SET_GEO_FILTERS, geoFilter: [geo1], filterApplied: true },
    ];
    const store = getMockedStore();

    store.dispatch(setGeo([geo1], true));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`Set polygon filter applied false when deleting the polygon`, () => {
    const expectedActions = [
      { type: SET_GEO_FILTERS, geoFilter: [], filterApplied: false },
    ];
    const store = getMockedStore();

    store.dispatch(setGeo([]));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`Should set map assets`, () => {
    const assets: Asset[] = [
      {
        name: 'Asset 1',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      },
    ];
    const expectedActions = [{ type: SET_ASSETS, assets }];
    const store = getMockedStore();
    store.dispatch(setAssets(assets));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`Should set map sources`, () => {
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
    const expectedActions = [{ type: SET_SOURCES, sources }];
    const store = getMockedStore();
    store.dispatch(setSources(sources));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`Should patch map source`, () => {
    const source = { id: '1', data: {} };
    const expectedActions = [{ type: PATCH_SOURCE, source }];
    const store = getMockedStore();
    store.dispatch(patchSource(source));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
