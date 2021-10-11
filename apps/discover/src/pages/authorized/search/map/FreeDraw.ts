import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
import simplify from '@turf/simplify';

import { log } from '_helpers/log';

import dragPan from './lib/drag_pan';

export const FreeDraw = DrawPolygon;

FreeDraw.onSetup = function OnSetup() {
  const polygon = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]],
    },
  });
  this.addFeature(polygon);
  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  dragPan.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.POLYGON);
  this.setActionableState({
    trash: true,
  });
  return {
    polygon,
    currentVertexPosition: 0,
    dragMoving: false,
  };
};

// eslint-disable-next-line no-multi-assign
FreeDraw.onDrag = FreeDraw.onTouchMove = function TouchMove(
  state: any,
  e: any
) {
  // eslint-disable-next-line no-param-reassign
  state.dragMoving = true;
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  state.polygon.updateCoordinate(
    `0.${state.currentVertexPosition}`,
    e.lngLat.lng,
    e.lngLat.lat
  );
  // eslint-disable-next-line no-param-reassign
  state.currentVertexPosition += 1;
  state.polygon.updateCoordinate(
    `0.${state.currentVertexPosition}`,
    e.lngLat.lng,
    e.lngLat.lat
  );
};

FreeDraw.onMouseUp = function MouseUp(state: any) {
  if (state.dragMoving && state.polygon) {
    const zoomOffset = 4;
    const safeZoom = // saftey is making sure we do not return 0 and break the next function
      this.map.getZoom() === zoomOffset ? 1 : this.map.getZoom() - 4;
    const tolerance = 3 / (safeZoom * 150) - 0.001; // https://www.desmos.com/calculator/b3zi8jqskw

    const simplifyMax = 10;
    const MAX_POINTS_API_ACCEPTS = 35; // it is actually 50, but let's be safe
    let simplifyCount = 0;
    let changedTolerance = tolerance;

    const reducePolygonCount = () => {
      simplifyCount += 1;
      // console.log('Polygon count:', state.polygon.coordinates[0].length);

      const polygonHasTooManyPoints =
        state.polygon.coordinates[0].length > MAX_POINTS_API_ACCEPTS;

      if (polygonHasTooManyPoints) {
        changedTolerance += 0.01; // lowering this number will increase the number of polygons

        simplify(state.polygon, {
          tolerance: changedTolerance,
          highQuality: false,
          mutate: true, // significant performance increase if true
        });

        // console.log('simplifyCount', simplifyCount);

        if (simplifyCount < simplifyMax) {
          reducePolygonCount();
        }
      }
    };

    try {
      reducePolygonCount();

      this.fireUpdate();

      this.changeMode(Constants.modes.SIMPLE_SELECT, {
        featureIds: [state.polygon.id],
      });
    } catch {
      log(`Error getting tolerance: ${tolerance}`, [], 2);
    }
  }
};

FreeDraw.onTouchEnd = function TouchEnd(state: any, e: any) {
  this.onMouseUp(state, e);
};

FreeDraw.fireUpdate = function FireUpdate() {
  this.map.fire(Constants.events.UPDATE, {
    action: Constants.updateActions.MOVE,
    features: this.getSelected().map((f: any) => f.toGeoJSON()),
  });
};

export default FreeDraw;
