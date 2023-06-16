import { CodeEditorTheme } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';

export const BASE_QUERY_KEY = 'transformations';

export const ABSOLUTE_TIME_FORMAT = 'DD MMM YYYY HH:mm:ss';
export const RELATIVE_TIME_THRESHOLD_IN_HOURS = 36;
export const TOOLTIP_DELAY_IN_MS = 300;

export const JOB_LIST_REFETCH_INTERVAL_IN_MS = 15000;
export const JOB_DETAILS_REFETCH_INTERVAL_IN_MS = 3000;
export const DATA_SOURCE_SELECT_BOX_LIST_HEIGHT = 700;

export const RUN_HISTORY_CHART_DEFAULT_MARGIN = {
  top: 40,
  right: 30,
  bottom: 40,
  left: 60,
};
export const RUN_HISTORY_CHART_NUMBER_OF_TICKS_X_AXIS = 4;
export const RUN_HISTORY_CHART_NUMBER_OF_TICKS_Y_AXIS = 4;
export const RUN_HISTORY_CHART_TICK_LABEL_BASE_STYLES = {
  fill: Colors['text-icon--medium'],
  fontFamily: 'Inter',
  fontSize: 12,
  fontWeight: 400,
};
export const RUN_HISTORY_CHART_TIME_FORMAT = 'H:mm:ss';
export const RUN_HISTORY_CHART_STROKE_DASHARRAY = '6,6';
export const RUN_HISTORY_CHART_STROKE_OPACITY = 0.5;

export const TRANSFORMATION_ACCEPTED_SOURCE_TYPES = [
  'assets',
  'datapoints',
  'events',
  'files',
  'labels',
  'relationships',
  'sequences',
  'stringdatapoints',
  'timeseries',
];
export const LARGE_MODAL_WIDTH = 620;

export const RELEASE_BANNER_SESSION_STORAGE_KEY =
  '@cognite/fusion/transformation-release-banner-closed';

export const SPARK_SQL_SCHEMA_DUMMY_COLUMN_TYPE = 'dummy-column';
export const QUICK_PROFILE_LIMIT = 1000;

export const TARGET_COLUMN_WIDTH = 332;
export const EDITOR_TITLE_HEIGHT = 53;
export const EDITOR_SECTION_MIN_WIDTH = 820;

export const EDITOR_COLUMN_MIN_WIDTH = 250;
export const EDITOR_COLUMN_MAX_WIDTH = 350;
export const EDITOR_VIEW_COLUMN_GAP = 12;
export const ARROW_COLUMN_MIN_WIDTH = 36;
export const ARROW_COLUMN_MAX_WIDTH = ARROW_COLUMN_MIN_WIDTH * 3;

export const PREVIEW_TAB_HEIGHT = 392;

export const DEFAULT_CODE_EDITOR_THEME: CodeEditorTheme = 'light';
export const CODE_EDITOR_THEME_LOCAL_STORAGE_KEY =
  '@cognite/fusion/transformations/code-editor-theme';
export const LAYOUT_MINIMIZED_SECTION_SIZE = 54;
export const LAYOUT_MIN_SECTION_SIZE_HORIZONTAL = 602;
export const LAYOUT_MIN_SECTION_SIZE_VERTICAL = 301;

export const PAGE_DIRECTION_LOCAL_STORAGE_KEY =
  '@cognite/fusion/transformations/page-direction';
