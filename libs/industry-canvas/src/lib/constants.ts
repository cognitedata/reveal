export const TOAST_POSITION = 'top-left' as const;

export enum QueryKeys {
  GET_CANVAS = 'canvas.get',
  SAVE_CANVAS = 'canvas.save',
  CREATE_CANVAS = 'canvas.create',
  ARCHIVE_CANVAS = 'canvas.archive',
  LIST_CANVASES = 'canvas.list',
  DELETE_CANVAS_ITEMS = 'canvas.delete-items',
  USER_PROFILE = 'user-profile',
  USER_PROFILES_BY_IDS = 'user-profiles-by-ids',
  LOCKING = 'canvas.locking',
}

export const SEARCH_QUERY_PARAM_KEY = 'search';

export const STAGE_ALT_CLICK_ZOOM_LEVEL = 0.25;
export const ZOOM_LEVELS = [
  0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0,
] as const;
export const ZOOM_DURATION_SECONDS = 0.1;
export const ZOOM_TO_FIT_MARGIN = 0.07;

export const FONT_SIZE = {
  '8px': '8px',
  '10px': '10px',
  '12px': '12px',
  '18px': '18px',
  '24px': '24px',
  '36px': '36px',
  '48px': '48px',
  '72px': '72px',
} as const;

export const LINE_STROKE_WIDTH = {
  SMALL: 2,
  MEDIUM: 6,
  LARGE: 10,
};

// TODO: These timeouts can be removed when we implement the appropriate event in UFV: https://cognitedata.atlassian.net/browse/UFV-587
export const SHAMEFUL_WAIT_TO_ENSURE_ANNOTATIONS_ARE_RENDERED_MS = 100;
export const SHAMEFUL_WAIT_TO_ENSURE_CONTAINERS_ARE_RENDERED_MS = 100;
