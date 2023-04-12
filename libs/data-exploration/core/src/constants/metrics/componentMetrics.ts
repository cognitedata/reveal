const DATA_EXPLORATION = 'DataExplorationComponent';
const DOWNLOAD = {
  TIME_SERIES: `${DATA_EXPLORATION}.Download.Timeseries`,
};
const OPEN = {
  FILE_SYNTAX: `${DATA_EXPLORATION}.Open.FileSyntax`,
};
const CLICK = {
  LOAD_MORE: `${DATA_EXPLORATION}.Click.LoadMore`,
  SORT_COLUMN: `${DATA_EXPLORATION}.Click.SortColumn`,
  UPLOAD: `${DATA_EXPLORATION}.Click.Upload`,
  FILE_UPLOAD_READY: `${DATA_EXPLORATION}.Click.FileUploadReadyState`,
  FILE_UPLOAD_PAUSE: `${DATA_EXPLORATION}.Click.FileUploadPause`,
  FILE_UPLOAD_STOP: `${DATA_EXPLORATION}.Click.FileUploadStop`,
  FILE_UPLOAD_CONTINUE: `${DATA_EXPLORATION}.Click.FileUploadContinue`,
  RESET_ALL_FILTERS: `${DATA_EXPLORATION}.Click.ResetAllFilters`,
  ROOT_ASSET: `${DATA_EXPLORATION}.Click.RootAsset`,
  COPY_TO_CLIPBOARD: `${DATA_EXPLORATION}.Click.CopyToClipboard`,
  METADATA_HIDE_EMPTY: `${DATA_EXPLORATION}.Click.MetadataHideEmpty`,
  BOOLEAN_FILTER: `${DATA_EXPLORATION}.Click.BooleanFilter`,
};
const SELECT = {
  COLUMN_SELECTION: `${DATA_EXPLORATION}.Select.ColumnSelection`,
  COLUMN_SELECTION_ALL: `${DATA_EXPLORATION}.Select.AllColumnSelection`,
  COLUMN_SELECTION_TAB: `${DATA_EXPLORATION}.Select.ColumnSelectionTab`,
  TIME_PERIOD: `${DATA_EXPLORATION}.Select.TimePeriod`,
  TIME_RANGE: `${DATA_EXPLORATION}.Select.TimeRange`,
  AGGREGATE_FILTER: `${DATA_EXPLORATION}.Select.AggregateFilter`,
  AGGREGATE_EVENT_FILTER: `${DATA_EXPLORATION}.Select.AggregateEventFilter`,
  AGGREGATE_TIMESERIES_FILTER: `${DATA_EXPLORATION}.Select.AggregateTimeseriesFilter`,
  ASSET_FILTER: `${DATA_EXPLORATION}.Select.AssetFilter`,
  DATE_FILTER: `${DATA_EXPLORATION}.Select.DateFilter`,
  LABEL_FILTER: `${DATA_EXPLORATION}.Select.LabelFilter`,
  METADATA_FILTER: `${DATA_EXPLORATION}.Select.MetadataFilter`,
  DATA_SET_FILTER: `${DATA_EXPLORATION}.Select.DataSetFilter`,
};

const SEARCH = {
  METADATA_FILTER: `${DATA_EXPLORATION}.Search.MetadataFilter`,
  PREVIEW_SEARCH: `${DATA_EXPLORATION}.Search.PreviewSearch`,
};

const INPUT = {
  NUMBER_FILTER: `${DATA_EXPLORATION}.Input.NumberFilter`,
  TEXT_FILTER: `${DATA_EXPLORATION}.Input.TextFilter`,
};

const FILE_PREVIEW = {
  FIND_IN_DOCUMENT_OPEN: `${DATA_EXPLORATION}.FilePreview.FindInDocumentOpen`,
  FIND_IN_DOCUMENT_VALUE_CHANGE: `${DATA_EXPLORATION}.FilePreview.FindInDocumentValueChange`,
  FIND_IN_DOCUMENT_NEXT_RESULT: `${DATA_EXPLORATION}.FilePreview.FindInDocumentNextResult`,
};

export const DATA_EXPLORATION_COMPONENT = {
  DOWNLOAD,
  OPEN,
  CLICK,
  SELECT,
  SEARCH,
  INPUT,
  FILE_PREVIEW,
};
