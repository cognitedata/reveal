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

export const defaultToStopBuildIssue = {};
