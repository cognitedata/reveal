/*!
 * Adapted from pnext/three-loader (https://github.com/pnext/three-loader)
 */
import { Color } from 'three';

export const DEFAULT_MAX_POINT_SIZE = 10;
export const DEFAULT_MIN_NODE_PIXEL_SIZE = 50;
export const DEFAULT_MIN_POINT_SIZE = 1;
export const DEFAULT_PICK_WINDOW_SIZE = 15;
export const DEFAULT_POINT_BUDGET = 3_000_000;
export const MAX_LOADS_TO_GPU = 15;
export const MAX_NUM_NODES_LOADING = 8;
export const UPDATE_THROTTLE_TIME_MS = 100;
export const PERSPECTIVE_CAMERA = 'PerspectiveCamera';
export const COLOR_BLACK: Color = new Color(0, 0, 0);
export const COLOR_WHITE: Color = new Color(1, 1, 1);
export const DEFAULT_EDL_NEIGHBOURS_COUNT = 16;
/**
 * Number of radii the EDL post-effect samples its neighbour ring at (radius, 2*radius, ...).
 * Sampling more than one scale separates large structures at distance in addition to thin
 * silhouettes, at a cost of DEFAULT_EDL_NEIGHBOURS_COUNT extra texture fetches per extra scale.
 * A value of 1 reproduces the original single-scale effect exactly.
 */
export const DEFAULT_EDL_SCALE_COUNT = 2;
/**
 * Radius, in pixels, of the depth-aware gap fill applied while compositing the point cloud.
 * When the camera is close and the point cloud no longer covers every pixel, an empty pixel
 * with enough covered neighbours within this radius adopts the nearest one, closing the gap
 * without inflating point sizes. Cost is O(radius^2) texture taps in the normalize shader.
 * 0 disables it.
 */
export const DEFAULT_POINTCLOUD_GAP_FILL_RADIUS = 3;
/**
 * Fraction of the point budget over which the LOD frontier is dithered. Nodes whose points
 * fall in the last `band` fraction of the budget render only a stochastically chosen subset of
 * their points, ramping from all to none, so the deepest visible nodes fade in as the camera
 * approaches instead of popping in whole. 0 disables dithering (hard budget cutoff, unchanged).
 */
export const DEFAULT_POINTCLOUD_LOD_DITHER_BAND = 0;
export const OBJECT_STYLING_TEXTURE_WIDTH = 256;
export const OBJECT_STYLING_TEXTURE_HEIGHT = 256;
