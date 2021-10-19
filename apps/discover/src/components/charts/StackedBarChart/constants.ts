import { Margins, AxisPlacement, Dimensions } from './types';

export const BAR_HEIGHT = 32;
export const LEGEND_FLOATING_HEIGHT = 24;
export const CHART_BACKGROUND_COLOR = 'var(--cogs-bg-accent)';
export const DEFAULT_BAR_COLOR = '#808080';
export const DEFAULT_NO_DATA_BAR_COLOR = '#00000010';

export const TICK_PADDING = 12;

export const LEGEND_BOTTOM_SPACING = {
  regular: 24,
  isolated: 44,
};

export const X_AXIS_LABELS_HEIGHT = {
  [AxisPlacement.Top]: 14,
  [AxisPlacement.Bottom]: 28,
};

export const DEFAULT_X_AXIS_SPACING = 100;
export const DEFAULT_Y_AXIS_SPACING = 100;
export const DEFAULT_X_AXIS_TICKS = 15;
export const DEFAULT_X_AXIS_PLACEMENT = AxisPlacement.Top;

export const DEFAULT_MARGINS: Margins = {
  top: 20,
  right: 20,
  bottom: 0,
  left: 5,
};

export const DEFAULT_COLOR_CONFIG = {
  colors: { default: DEFAULT_BAR_COLOR },
  defaultColor: DEFAULT_BAR_COLOR,
};

export const DEFAULT_ZOOM_STEP_SIZE = 100;

export const UNINITIALIZED_CHART_DIMENTIONS: Dimensions = {
  height: 0,
  width: 0,
};

export const EMPTY_STATE_TEXT =
  'Please enable at least one checkbox or reset graph to default';
export const RESET_TO_DEFAULT_BUTTON_TEXT = 'Reset to default';

export const DEFAULT_NO_DATA_AMONG_SELECTED_CHECKBOXES_TEXT =
  'No data among selected options';
export const DEFAULT_NO_DATA_TEXT = 'No data';
