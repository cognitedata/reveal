import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

export const AUTH2_API_URL = 'https://auth.cognite.com';

export const TOAST_POSITION = 'top-left' as const;
export const ANNOTATION_TOOLTIP_POSITION = TooltipAnchorPosition.BOTTOM_LEFT;

export enum MetricEvent {
  // Canvas management
  CANVAS_VIEWED = 'IC.Canvas.Viewed',
  CANVAS_CREATED = 'IC.Canvas.Created',
  CANVAS_ARCHIVED = 'IC.Canvas.Archived',

  // Container
  RESOURCE_SELECTOR_RESOURCES_ADDED = 'IC.ResourceSelector.ResourcesAdded',
  CANVAS_DROPDOWN_OPENED = 'IC.CanvasDropdown.Opened',
  CONTAINER_LABEL_CHANGED = 'IC.Container.Label.Changed',
  TIMESERIES_APPLY_TO_ALL_TOGGLED = 'IC.Timeseries.ApplyToAllToggled',
  TIMESERIES_DATE_RANGE_CHANGED = 'IC.Timeseries.DateRangeChanged',
  CONTAINER_OPEN_IN_DATA_EXPLORER_CLICKED = 'IC.Container.OpenInDataExplorerClicked',
  CONTAINER_OPEN_IN_RESOURCE_SELECTOR_CLICKED = 'IC.Container.OpenInResourceSelectorClicked',
  DOCUMENT_SUMMARIZE_CLICKED = 'IC.Document.SummarizeClicked',

  // Annotation
  ANNOTATION_CREATED = 'IC.Annotation.Created',
  CONTAINER_ANNOTATION_CLICKED = 'IC.ContainerAnnotation.Clicked',

  // Contextual tooltip
  ASSET_TOOLTIP_ADD_THREE_D = 'IC.AssetTooltip.AddThreeD',
  ASSET_TOOLTIP_ADD_TIMESERIES = 'IC.AssetTooltip.AddTimeseries',
  ASSET_TOOLTIP_OPEN_IN_RESOURCE_SELECTOR = 'IC.AssetTooltip.OpenInResourceSelector',
  ASSET_TOOLTIP_OPEN_TIMESERIES_TAB_IN_RESOURCE_SELECTOR = 'IC.AssetTooltip.OpenTimeseriesTabInResourceSelector',
  ASSET_TOOLTIP_ADD_ASSET = 'IC.AssetTooltip.AddAsset',
  ASSET_TOOLTIP_OPEN_IN_DATA_EXPLORER = 'IC.AssetTooltip.OpenInDataExplorer',
  FILE_TOOLTIP_ADD_FILE = 'IC.FileTooltip.AddFile',

  // Other
  HOTKEYS_USED = 'IC.Hotkeys.Used',
  DOWNLOAD_AS_PDF_CLICKED = 'IC.DownloadAsPdf.Clicked',
  SHOW_CONNECTION_LINES_TOGGLED = 'IC.ShowConnectionLines.Toggled',
  ADD_DATA_BUTTON_CLICKED = 'IC.AddDataButton.Clicked',
}

export enum QueryKeys {
  GET_CANVAS = 'canvas.get',
  SAVE_CANVAS = 'canvas.save',
  SAVE_COMMENT = 'comment.save',
  UPSERT_COMMENTS = 'comment.upsert',
  DELETE_COMMENT = 'comment.delete',
  CREATE_CANVAS = 'canvas.create',
  ARCHIVE_CANVAS = 'canvas.archive',
  LIST_CANVASES = 'canvas.list',
  LIST_COMMENTS = 'comments.list',
  GET_COMMENT = 'comments.get',
  DELETE_CANVAS_ITEMS = 'canvas.delete-items',
  USER_PROFILE = 'user-profile',
  USERS = 'users',
  USER_PROFILES_BY_IDS = 'user-profiles-by-ids',
  USER_PROFILES_SEARCH = 'user-profiles-search',
  LOCKING = 'canvas.locking',
  CREATE_SPACE = 'create-space',
  LIST_SPACES = 'list-spaces',
  AUTH2_USERS = 'org-users',
  AUTH2_USERS_BY_RESOURCE = 'org-user-invitations-by-resource',
  AUTH2_INVITATIONS = 'org-user-invitations',
  AUTH2_REVOKE_INVITATIONS = 'org-user-revoke-invitations',
}

export const SEARCH_QUERY_PARAM_KEY = 'search';

export const STAGE_ALT_CLICK_ZOOM_LEVEL = 0.25;
export const ZOOM_LEVELS = [
  0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0,
] as const;
export const ZOOM_DURATION_SECONDS = 0.1;
export const ZOOM_TO_FIT_MARGIN = 0.07;

export const FONT_SIZES = [
  '8px',
  '10px',
  '12px',
  '18px',
  '24px',
  '36px',
  '48px',
  '72px',
] as const;
export const DEFAULT_FONT_SIZE = '36px';
export const MIN_FONT_SIZE = 1;
export const MAX_FONT_SIZE = 999;

export const MIN_STROKE_WIDTH = 1;
export const MAX_STROKE_WIDTH = 50;
export const LINE_DASH_ARRAY = [10, 10];

// TODO: These timeouts can be removed when we implement the appropriate event in UFV: https://cognitedata.atlassian.net/browse/UFV-587
export const SHAMEFUL_WAIT_TO_ENSURE_ANNOTATIONS_ARE_RENDERED_MS = 100;
export const SHAMEFUL_WAIT_TO_ENSURE_CONTAINERS_ARE_RENDERED_MS = 100;

export const CommentsFeatureFlagKey = 'UFV_INDUSTRY_CANVAS_COMMENTS';

export const CANVAS_FLOATING_ELEMENT_MARGIN = 15;
export const CANVAS_MIN_WIDTH = 40 + 2 * CANVAS_FLOATING_ELEMENT_MARGIN; // close button width + left&right margin
export const ZOOM_CONTROLS_COGPILOT_ENABLED_RIGHT_MARGIN = 130;

// Used for matching user ids in the text like: <@AAA__bsd123> etc;
export const USER_IDENTIFIER_REGEXP = /<@([a-zA-Z0-9_-]+)>/g;
export const USER_PROFILES_LIST_LIMIT = 1000;
