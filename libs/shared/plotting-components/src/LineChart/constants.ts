import { CSSProperties } from 'react';

export const PLOT_CLASSNAME = 'nsewdrag drag';

export const DEFAULT_BACKGROUND_COLOR = 'var(--cogs-surface--medium)';

export const TICK_COLOR = 'var(--cogs-border--muted)';
export const LABEL_COLOR = 'var(--cogs-text-icon--muted)';

export const TITLE_COLOR = 'var(--cogs-text-icon--strong)';
export const SUBTITLE_COLOR = 'var(--cogs-text-icon--medium)';

export const DEFAULT_PADDING = 16;
export const SMALL_VARIANT_PADDING = '4px 8px';

export const DEFAULT_MARGIN = 1;

export const LINE_WIDTH = 1.4;
export const MARKER_SIZE = 8;
export const HOVER_MARKER_BORDER_WIDTH = 4;
export const DEFAULT_LINE_COLOR = '#4a67fb'; // Don't use cogs color token here.
export const DEFAULT_LINE_NAME = 'Line';

export const BUTTON_ZOOM_STEP_SIZE = 5; // Percentage

export const AXIS_TITLE_MARGIN = 24;
export const TICK_LABEL_PADDING = 10;

export const DEFAULT_STYLE_PROPERTIES: CSSProperties = {
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  padding: DEFAULT_PADDING,
};
