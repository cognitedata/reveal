import { configureCacheMock } from '__test-utils/mockCache';

jest.mock('mapbox-gl', () => {
  class ScaleControl {}
  class Map {
    removeLayer = jest.fn();

    addControl = jest.fn();

    on = jest.fn();

    addSource = jest.fn();

    isStyleLoaded = () => true;

    getLayer = () => true;

    getSource = (name: string) => ({
      name,
      setData: jest.fn(),
    });
  }

  class LngLat {
    _lng: number;

    _lat: number;

    constructor(lng: number, lat: number) {
      // eslint-disable-next-line no-underscore-dangle
      this._lng = lng;
      // eslint-disable-next-line no-underscore-dangle
      this._lat = lat;
    }
  }

  return { Map, ScaleControl, LngLat };
});

jest.mock('html2canvas', () => {
  return () =>
    Promise.resolve({
      toDataURL() {
        return '';
      },
    });
});

HTMLCanvasElement.prototype.getContext = jest.fn();

configureCacheMock();

export {};
