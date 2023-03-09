import { CSSProperties } from 'react';

import { AxisDirectionConfig, Config, Layout, Variant } from './types';

export const DEFAULT_BACKGROUND_COLOR = '#fafafa';

export const TICK_COLOR = '#d9d9d950';
export const LABEL_COLOR = '#00000075';

export const TITLE_COLOR = '#000000';
export const SUBTITLE_COLOR = '#00000075';

export const DEFAULT_PADDING = 16;
export const SMALL_VARIANT_PADDING = 8;

export const DEFAULT_MARGIN = 1;

export const LINE_WIDTH = 1.4;
export const DEFAULT_LINE_COLOR = '#4A67FB';
export const DEFAULT_LINE_NAME = 'Line';

export const BUTTON_ZOOM_STEP_SIZE = 5; // percentage

export const HOVER_MARKER_SIZE = 12;
export const HOVER_MARKER_BORDER_WIDTH = 2;

export const DEAULT_LAYOUT: Layout = {
  legendPlacement: 'left',
  showTitle: true,
  showSubtitle: true,
  showLegend: true,
  showAxisNames: true,
  showTicks: true,
  showTickLabels: true,
  showFilters: true,
  showActions: true,
  showMarkers: true,
  showHoverMarker: true,
  showHoverLine: true,
  showHoverLineInfo: true,
};

export const LAYOUT_BY_VARIANT: Record<Variant, Layout> = {
  small: {
    ...DEAULT_LAYOUT,
    showTitle: false,
    showSubtitle: false,
    showLegend: false,
    showAxisNames: false,
    showTicks: false,
    showTickLabels: false,
    showFilters: false,
    showActions: false,
    showMarkers: false,
  },
  medium: {
    ...DEAULT_LAYOUT,
    showTitle: false,
    showSubtitle: false,
    showLegend: false,
    showAxisNames: false,
    showFilters: false,
    showActions: false,
  },
  large: {
    ...DEAULT_LAYOUT,
  },
};

export const DEFAULT_AXIS_DIRECTION_CONFIG: AxisDirectionConfig = 'x+y';

export const DEAULT_CONFIG: Config = {
  responsive: true,
  scrollZoom: DEFAULT_AXIS_DIRECTION_CONFIG,
  selectionZoom: DEFAULT_AXIS_DIRECTION_CONFIG,
  buttonZoom: DEFAULT_AXIS_DIRECTION_CONFIG,
  pan: DEFAULT_AXIS_DIRECTION_CONFIG,
};

export const DEFAULT_STYLE_PROPERTIES: CSSProperties = {
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  padding: DEFAULT_PADDING,
};
