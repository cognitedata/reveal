// @ts-expect-error this is not exposed
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
// @ts-expect-error this is not exposed
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
// @ts-expect-error this is not exposed
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';

import { mouseUp } from './mouseUp';
import { dragPan } from './dragPan';

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

FreeDraw.mouseUp = mouseUp;

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
