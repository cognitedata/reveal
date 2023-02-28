import { Layout, Variant } from './types';

export const DEFAULT_BACKGROUND_COLOR = '#fafafa';

export const TICK_COLOR = '#d9d9d950';
export const LABEL_COLOR = '#00000075';

export const TITLE_COLOR = '#000000';
export const SUBTITLE_COLOR = '#00000075';

export const DEFAULT_MARGIN = 5;

export const LINE_WIDTH = 1.4;
export const DEFAULT_LINE_COLOR = '#4A67FB';
export const DEFAULT_LINE_NAME = 'Line';

export const HOVER_MARKER_SIZE = 12;
export const HOVER_MARKER_BORDER_WIDTH = 2;

export const DEAULT_LAYOUT: Required<Layout> = {
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  responsive: true,
  legendPlacement: 'left',
  showTitle: true,
  showSubtitle: true,
  showLegend: true,
  showAxisNames: true,
  showTicks: true,
  showTickLabels: true,
};

export const LAYOUT_BY_VARIANT: Record<Variant, Required<Layout>> = {
  small: {
    ...DEAULT_LAYOUT,
    showTitle: false,
    showSubtitle: false,
    showLegend: false,
    showAxisNames: false,
    showTicks: false,
    showTickLabels: false,
  },
  medium: {
    ...DEAULT_LAYOUT,
    showTitle: false,
    showSubtitle: false,
    showLegend: false,
    showAxisNames: false,
    showTicks: true,
    showTickLabels: true,
  },
  large: {
    ...DEAULT_LAYOUT,
    showTitle: true,
    showSubtitle: true,
    showLegend: true,
    showAxisNames: true,
    showTicks: true,
    showTickLabels: true,
  },
};
