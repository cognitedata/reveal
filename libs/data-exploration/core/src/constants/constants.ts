export const DASH = '–'; // mostly used to display empty record in UI
export const UNIT_SEPARATOR = String.fromCharCode(31); // Unit separator; between fields of a record, or members of a row.
export const SPACE = String.fromCharCode(32); // Space, the internationally recommended thousands separator. (source: https://en.wikipedia.org/wiki/Decimal_separator)
export const METADATA_KEY_SEPARATOR = '-';
export const COPIED_TEXT = 'Copied'; // The message to show in toast when something is copied
export const DOCUMENT_ICON_FALLBACK_VALUE = 'file.txt'; // The fallback icon value when mimetype is undefined.

export enum ViewType {
  All = 'all',
  Asset = 'asset',
  Canvas = 'canvas',
  IndustryCanvas = 'industryCanvas',
  TimeSeries = 'timeSeries',
  File = 'file',
  Event = 'event',
  Sequence = 'sequence',
  ThreeD = 'threeD',
}

// sub-app name configured in cdf-hu > cdf-navigation > sections - app.linkTo i.e. fusion sub apps configuration
export const SUB_APP_PATH = 'explore';

export const SUMMERY_CARD_DATA_ROWS = 5;
