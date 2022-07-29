// import MapboxGLDraw from '@mapbox/mapbox-gl-draw';
import { DrawMode } from './types';

// for the reader: perhaps make a PR upstream to export this
export const drawModes: Record<string, DrawMode> = {
  DRAW_LINE_STRING: 'draw_line_string',
  DRAW_POLYGON: 'draw_polygon',
  DRAW_POINT: 'draw_point',
  SIMPLE_SELECT: 'simple_select',
  DIRECT_SELECT: 'direct_select',
  STATIC: 'static',
};

// wish we could do:
// export const drawModes = MapboxGLDraw.modes;
