/*!
 * Adapted from pnext/three-loader (https://github.com/pnext/three-loader)
 */
import { Color } from 'three';

export const DEFAULT_MAX_POINT_SIZE = 10;
export const DEFAULT_MIN_NODE_PIXEL_SIZE = 50;
export const DEFAULT_MIN_POINT_SIZE = 1;
export const DEFAULT_PICK_WINDOW_SIZE = 15;
// Number of high bits of the packed 32-bit pick output holding the node index; the remaining
// low bits hold the point index. 8 matches the legacy layout (RGB = point index, A = node index).
export const DEFAULT_NODE_INDEX_BITS = 8;
export const DEFAULT_POINT_BUDGET = 3_000_000;
export const MAX_LOADS_TO_GPU = 15;
export const MAX_NUM_NODES_LOADING = 8;
export const UPDATE_THROTTLE_TIME_MS = 100;
export const PERSPECTIVE_CAMERA = 'PerspectiveCamera';
export const COLOR_BLACK: Color = new Color(0, 0, 0);
export const COLOR_WHITE: Color = new Color(1, 1, 1);
export const DEFAULT_EDL_NEIGHBOURS_COUNT = 16;
// Largest supported EDL radius. Larger radii give thick, heavy outlines and widen the pick window.
export const MAX_EDL_RADIUS = 5;
/**
 * Half-width, in samples, of the depth-aware gap fill applied while compositing the point
 * cloud. An empty pixel with enough covered neighbours adopts the nearest one, closing the gap
 * without inflating point sizes. Cost is O(radius^2) texture taps per empty pixel per step.
 * 0 disables it.
 */
export const DEFAULT_POINTCLOUD_GAP_FILL_RADIUS = 2;
/**
 * Number of strided search widths the gap fill tries per empty pixel: step 1px, 2px, 4px, ...
 * The tight step closes fine gaps seen from a distance; wider steps bridge the large gaps that
 * open up with the camera close. Reaches ~GAP_FILL_RADIUS * 2^(steps-1) pixels.
 */
export const DEFAULT_POINTCLOUD_GAP_FILL_STEPS = 5;
/**
 * Largest hole the fill will bridge, in world units (scene metres) at the surrounding
 * surface's depth - NOT pixels. This is what makes the fill camera-distance aware: 0.3 m of
 * surface projects to many pixels up close (big on-screen gaps get filled) but only a few
 * pixels from far away (the model keeps its true silhouette). Independent of the depth checks.
 */
export const DEFAULT_POINTCLOUD_GAP_FILL_MAX_WORLD_GAP = 0.3;
/**
 * Depth spread a gap fill tolerates as "one surface", as a fraction of the surface's view-space
 * distance. Covers curvature and noise. Lower = fills only very flat patches, less bleeding
 * across silhouettes; higher = fills more aggressively.
 */
export const DEFAULT_POINTCLOUD_GAP_FILL_DEPTH_TOLERANCE = 0.02;
/**
 * Extra depth spread tolerated per world unit of search-window width, to allow steeply grazing
 * surfaces (a floor seen edge-on) whose depth changes fast across the screen. ~tan of the
 * steepest grazing angle still treated as a fillable surface (3 ~= 72 degrees).
 */
export const DEFAULT_POINTCLOUD_GAP_FILL_GRAZE_TOLERANCE = 3.0;
/**
 * Coverage-weight threshold, under point blending, below which a pixel is treated as a gap even
 * though the depth pre-pass gave it valid depth. The depth pre-pass writes full opaque depth for
 * any pixel inside a point's circular footprint, including one right at the sprite's edge that
 * the separate weighted colour pass only gave a sliver of coverage (color.w near 0) - visually a
 * gap, but invisible to a depth>=1 check alone. 0 disables this (only literal depth>=1 gaps are
 * filled).
 */
export const DEFAULT_POINTCLOUD_GAP_FILL_MIN_COVERAGE_WEIGHT = 0.2;
export const OBJECT_STYLING_TEXTURE_WIDTH = 256;
export const OBJECT_STYLING_TEXTURE_HEIGHT = 256;
