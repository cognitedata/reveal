import { Layout, Variant } from './types';

export const DEAULT_LAYOUT: Layout = {
  legendPlacement: 'left',
  showTitle: true,
  showSubtitle: true,
  showLegend: true,
  showAxisNames: 'x+y',
  showTicks: true,
  showTickLabels: 'x+y',
  showFilters: true,
  showActions: true,
  showMarkers: true,
  showTooltip: true,
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
    showTickLabels: 'x',
    showFilters: false,
    showActions: false,
    showMarkers: false,
    showHoverMarker: true,
    showHoverLineInfo: false,
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
