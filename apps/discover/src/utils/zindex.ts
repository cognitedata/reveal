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
  'ADD_DOC_TO_FAVS',
  'ACCESS_DENIED',
  'PROFILE_CARD',
  'DOC_INFO_PANEL',
  'FILTER_HEADER',
  'FILTER_BOX', // (FilterDropdown), Advanced Search
  'BASE_FILTER', // (OffsetFilter, DepthFilter, DocumentTypeFilter, SourceFilter)
  'FILTER',
  'LAYER_SELECTOR',
  'MANAGE_COLUMNS',
  'SEISMIC_PREVIEW',
  'SEISMIC_PREVIEW_COLORBAND',
  'IMAGE_COMPARE_DRAGGER',
  'QUERY_BUILDER',
  'SCROLLBAR',
  'DROPDOWN_SELECT',
  'WELLBORE_SEQUENCE',
  'CLOSE_FILTERS',
  'SEARCH_RESULTS',
  'IMAGE_COMPARER',
  'TABLE_ROW_HOVER',
  'TABLE_HEADER',
  'TABLE_CELL',
  'HISTOGRAM_HANDLE',
  'MAP_TOP_BUTTONS',
  'MAP_EXPANDER',
  'MAP_RIGHT_BUTTONS',
  // 'MAP_DOCKED',
  'MAP',
  'BASE_MAP',
  'MAP_TOGGLE_BUTTON',
  'MAIN_LAYER', // (base TYPEAHEAD from _comp, HISTOGRAM_TRACK, Autocomplete, AssetMapSearchTextbox, FloatingActions)
  'APP_FRAME',
  'MAIN_NAVIGATION',
  'TAB_SCROLL_BUTTON',
  //
  // things closer to here are shown BELOW
  //

  'MINIMUM',
] as const;

export default createLayers(LAYERS);
