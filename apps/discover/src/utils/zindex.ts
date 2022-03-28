import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  //
  // things closer to here are shown on TOP (ie: have high z-index)
  //

  'COOKIE_CONSENT',
  'TOP_BAR',
  'PAGE_HEADER',
  'OVERLAY_LOADER',
  'OVERLAY_NAVIGATION',
  'MAP_DOCUMENT_PREVIEW', // doc preview card
  'RESIZE_BAR',
  'SEARCH',
  'SEARCH_HISTORY', // left sidebar
  'BULK_ACTION',
  'FILTER_HEADER',
  'FILTER_BOX', // (FilterDropdown), Advanced Search
  'FILTER',
  'LAYER_SELECTOR',
  'MANAGE_COLUMNS',
  'SEISMIC_PREVIEW',
  'IMAGE_COMPARE_DRAGGER',
  'SCROLLBAR',
  'TABLE_STICKY_COLUMN_HEADER',
  'TABLE_STICKY_COLUMN_CELL',
  'TABLE_ROW_HOVER',
  'TABLE_HEADER',
  'TABLE_CELL_EXPAND_ICON',
  'MAP_TOP_BUTTONS',
  'MAP_EXPANDER',
  'MAP_RIGHT_BUTTONS',
  'MAP',
  'MAIN_LAYER', // (base TYPEAHEAD from _comp, HISTOGRAM_TRACK, Autocomplete, AssetMapSearchTextbox, FloatingActions)
  'APP_FRAME',
  'TAB_SCROLL_BUTTON',
  //
  // things closer to here are shown BELOW
  //

  'MINIMUM',
] as const;

export default createLayers(LAYERS);
