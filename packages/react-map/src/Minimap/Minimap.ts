/* eslint-disable */
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import mapboxgl, { MapMouseEvent } from 'maplibre-gl';

import { Options } from './types';

const defaultOptions: Options = {
  id: 'mapboxgl-minimap',
  width: '200px',
  height: '140px',
  style: '',
  center: [0, 0],
  zoom: -1,

  // should be a function; will be bound to Minimap
  zoomAdjust: noop,

  maxBounds: 'parent',
  zoomOffset: 4,
  lineColor: '#08F',
  lineWidth: 1,
  lineOpacity: 1,

  fillColor: '#F80',
  fillOpacity: 0.25,
  interactions: {
    dragPan: false,
    scrollZoom: false,
    boxZoom: false,
    dragRotate: false,
    keyboard: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
  },
};

export class Minimap {
  _trackingRectCoordinates: any[];

  _miniMapCanvas: any;

  _parentMap: any;

  options: Options;

  _miniMap: any;

  _container: any;

  _trackingRect: any;

  _isDragging = false;

  _isCursorOverFeature = false;

  _previousPoint = [0, 0];

  _currentPoint = [0, 0];

  constructor(options?: Partial<Options>) {
    this._parentMap = null;
    this._isDragging = false;
    this._isCursorOverFeature = false;
    this._previousPoint = [0, 0];
    this._currentPoint = [0, 0];
    this._trackingRectCoordinates = [[[], [], [], [], []]];

    this.options = { ...defaultOptions, ...options };
  }

  onRemove() {
    const miniMap = this._miniMap;
    this._container.parentNode.removeChild(this._container);

    if (miniMap.getLayer('trackingRectOutline')) {
      miniMap.removeLayer('trackingRectOutline');
    }

    if (miniMap.getLayer('trackingRectFill')) {
      miniMap.removeLayer('trackingRectFill');
    }
    if (miniMap.getSource('trackingRect')) {
      miniMap.removeSource('trackingRect');
    }

    this._parentMap = undefined;
  }

  onAdd(parentMap: mapboxgl.Map): HTMLElement {
    this._parentMap = parentMap;

    const opts = this.options;
    // eslint-disable-next-line no-multi-assign
    const container = (this._container = this._createContainer(parentMap));
    this._miniMap = new mapboxgl.Map({
      attributionControl: false,
      container,
      style: opts.style,
      zoom: opts.zoom,
      center: opts.center,
    });

    this._miniMap.on('load', this._load.bind(this));

    return this._container;
  }

  _load = () => {
    const opts = this.options;
    const parentMap = this._parentMap;
    const miniMap = this._miniMap;

    if (!parentMap) return;

    Object.entries(opts.interactions).forEach(([key, value]) => {
      if (value !== true) {
        miniMap[key].disable();
      }
    });

    if (opts.maxBounds === 'parent') {
      opts.bounds = parentMap.getMaxBounds();
    }
    if (isObject(opts.bounds)) {
      miniMap.fitBounds(opts.bounds, { duration: 50 });
    }

    const bounds = miniMap.getBounds();

    this._convertBoundsToPoints(bounds);

    if (!miniMap.getSource('trackingRect')) {
      miniMap.addSource('trackingRect', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: 'trackingRect',
          },
          geometry: {
            type: 'Polygon',
            coordinates: this._trackingRectCoordinates,
          },
        },
      });
    }

    if (!miniMap.getLayer('trackingRectOutline')) {
      miniMap.addLayer({
        id: 'trackingRectOutline',
        type: 'line',
        source: 'trackingRect',
        layout: {},
        paint: {
          'line-color': opts.lineColor,
          'line-width': opts.lineWidth,
          'line-opacity': opts.lineOpacity,
        },
      });
    }

    if (!miniMap.getLayer('trackingRectFill')) {
      // needed for dragging
      miniMap.addLayer({
        id: 'trackingRectFill',
        type: 'fill',
        source: 'trackingRect',
        layout: {},
        paint: {
          'fill-color': opts.fillColor,
          'fill-opacity': opts.fillOpacity,
        },
      });
    }

    this._trackingRect = this._miniMap.getSource('trackingRect');

    this._update();

    parentMap.on('move', this._update.bind(this));

    miniMap.on('mousemove', this._mouseMove.bind(this));
    miniMap.on('mousedown', this._mouseDown.bind(this));
    miniMap.on('mouseup', this._mouseUp.bind(this));

    miniMap.on('touchmove', this._mouseMove.bind(this));
    miniMap.on('touchstart', this._mouseDown.bind(this));
    miniMap.on('touchend', this._mouseUp.bind(this));

    this._miniMapCanvas = miniMap.getCanvasContainer();
    this._miniMapCanvas.addEventListener('wheel', this._preventDefault);
    this._miniMapCanvas.addEventListener('mousewheel', this._preventDefault);
  };

  _mouseDown = (e: MapMouseEvent) => {
    if (this._isCursorOverFeature && this._parentMap) {
      this._isDragging = true;
      this._previousPoint = this._currentPoint;
      this._currentPoint = [e.lngLat.lng, e.lngLat.lat];
    }
  };

  _mouseUp = () => {
    this._isDragging = false;
  };

  _mouseMove = (e: MapMouseEvent) => {
    if (!this._parentMap) return;
    const miniMap = this._miniMap;
    const view = miniMap.queryRenderedFeatures(e.point, {
      layers: ['trackingRectFill'],
    });

    // don't update if we're still hovering the area
    if (!(this._isCursorOverFeature && view.length > 0)) {
      this._isCursorOverFeature = view.length > 0;
      this._miniMapCanvas.style.cursor = this._isCursorOverFeature
        ? 'move'
        : '';
    }

    if (this._isDragging) {
      this._previousPoint = this._currentPoint;
      this._currentPoint = [e.lngLat.lng, e.lngLat.lat];

      const offset = [
        this._previousPoint[0] - this._currentPoint[0],
        this._previousPoint[1] - this._currentPoint[1],
      ];

      const newBounds = this._moveTrackingRect(offset);

      this._parentMap.fitBounds(newBounds, {
        duration: 0,
      });
    }
  };

  _moveTrackingRect = (offset: any[]) => {
    const source = this._trackingRect;
    const data = source._data;
    const { bounds } = data.properties;

    bounds._ne.lat -= offset[1];
    bounds._ne.lng -= offset[0];
    bounds._sw.lat -= offset[1];
    bounds._sw.lng -= offset[0];

    this._convertBoundsToPoints(bounds);
    source.setData(data);

    return bounds;
  };

  _update() {
    if (this._isDragging || !this._parentMap) {
      return;
    }
    const parentBounds = this._parentMap.getBounds();
    this._setTrackingRectBounds(parentBounds);

    if (isFunction(this.options.zoomAdjust)) {
      this._zoomAdjust();
    }
  }

  _zoomAdjust = () => {
    if (!this._parentMap) return;
    const opts = this.options;

    const miniMap = this._miniMap;
    const parentMap = this._parentMap;
    const miniZoom = parseInt(miniMap.getZoom(), 10);
    const parentZoom = parseInt(parentMap.getZoom(), 10);

    if (opts.zoomOffset) {
      if (
        Math.abs(miniZoom - parentZoom) >= opts.zoomOffset ||
        parentZoom - miniZoom < opts.zoomOffset
      ) {
        miniMap.setCenter(parentMap.getCenter());
        miniMap.setZoom(parentZoom - opts.zoomOffset);
      }
    }
  };

  _createContainer = (parentMap: any) => {
    const opts = this.options;
    const container = document.createElement('div');

    container.className = 'mapboxgl-ctrl-minimap mapboxgl-ctrl';
    container.setAttribute(
      'style',
      `width: ${opts.width}; height: ${opts.height};`
    );
    container.addEventListener('contextmenu', this._preventDefault);

    parentMap.getContainer().appendChild(container);

    if (opts.id) {
      container.id = opts.id;
    }

    return container;
  };

  _preventDefault = (e: any) => {
    e.preventDefault();
  };

  _setTrackingRectBounds(bounds: any) {
    const source = this._trackingRect;
    const data = source._data;

    data.properties.bounds = bounds;
    this._convertBoundsToPoints(bounds);
    source.setData(data);
  }

  _convertBoundsToPoints(bounds: any) {
    const ne = bounds._ne;
    const sw = bounds._sw;
    const trc = this._trackingRectCoordinates;

    trc[0][0][0] = ne.lng;
    trc[0][0][1] = ne.lat;
    trc[0][1][0] = sw.lng;
    trc[0][1][1] = ne.lat;
    trc[0][2][0] = sw.lng;
    trc[0][2][1] = sw.lat;
    trc[0][3][0] = ne.lng;
    trc[0][3][1] = sw.lat;
    trc[0][4][0] = ne.lng;
    trc[0][4][1] = ne.lat;
  }
}
export default Minimap;
