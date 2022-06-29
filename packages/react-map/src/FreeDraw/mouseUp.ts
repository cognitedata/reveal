// @ts-expect-error this is not exposed
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import simplify from '@turf/simplify';

export function mouseUp(state: any) {
  if (state.dragMoving && state.polygon) {
    const zoomOffset = 4;
    const safeZoom = // saftey is making sure we do not return 0 and break the next function
      // @ts-expect-error this shadows stuff
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

      // @ts-expect-error this shadows stuff
      this.fireUpdate();

      // @ts-expect-error this shadows stuff
      this.changeMode(Constants.modes.SIMPLE_SELECT, {
        featureIds: [state.polygon.id],
      });
    } catch {
      // eslint-disable-next-line no-console
      console.error(`Error getting tolerance: ${tolerance}`, [], 2);
    }
  }
}
