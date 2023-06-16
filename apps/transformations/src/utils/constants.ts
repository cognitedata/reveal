import { FormatFnOptions } from 'sql-formatter';

export const MAX_NETWORK_RETRIES = 3;

export const BASE_QUERY_KEY = 'transformations';
export const RAW_PROFILING_CDF_VERSION = 'v20211207';

export const DETAILS_BANNER_HEIGHT = 56;
export const DETAILS_DESTINATION_PANEL_SIZE = 332;
export const DETAILS_SIDE_PANEL_NAVIGATION_WIDTH = 61;
export const DETAILS_SIDE_PANEL_MIN_WIDTH = 320;
export const DETAILS_SIDE_PANEL_MAX_WIDTH = 600;
export const DETAILS_SIDE_PANEL_TRANSITION_DURATION = 0.5;
export const DETAILS_SIDE_PANEL_TRANSITION_METHOD = 'ease';

export const SIDE_PANEL_FOOTER_HEIGHT = 68;
export const MODAL_WIDTH = 400;
export const TOOLTIP_DELAY_IN_MS = 300;
export const RAW_PAGE_SIZE_LIMIT = 10000;

export const PREVIEW_ROW_LIMIT_OPTIONS = [1000] as const;
export const PREVIEW_SOURCE_LIMIT_OPTIONS = [100, 1000, -1] as const;

export const UPLOAD_MODAL_WIDTH = 600;
export const TOPBAR_NAVIGATION_HEIGHT = 56;
export const TAB_HEIGHT = 49;

export const TABLE_ROW_HEIGHT = 30;
export const TABLE_CELL_EXPANDED_WIDTH = 465;

export const SIDEBAR_PROFILING_DRAWER_WIDTH = 350;
export const SIDEBAR_PROFILING_CLOSE_BUTTON_SPACE = 64;

export const QUERY_PREVIEW_RESULTS_KEY = 'query_preview_results';
export const SPREADSHEET = 'spreadsheet';
export const PROFILING = 'profiling';

export const QUERY_PREVIEW_RESULTS_TABLE_DEFAULT_HEIGHT = 400;
export const QUERY_PREVIEW_RESULTS_TABLE_EXTRA_HEIGHT = 40;

export const CLI_MANIFEST = {
  HEADER: '# Manifest file downloaded from fusion',
  FOOTER: `# Specify credentials separately like this:
# authentication:
#   read:
#     clientId: \${READ_CLIENT_ID}
#     clientSecret: \${READ_CLIENT_SECRET}
#     tokenUrl: \${READ_TOKEN_URL}
#     cdfProjectName: \${READ_CDF_PROJECT_NAME}
#     # Optional: If idP requires providing the scopes
#     scopes:
#       - \${READ_SCOPES}
#     # Optional: If idP requires providing the audience
#     audience: \${READ_CDF_AUDIENCE}
#   write:
#     clientId: \${WRITE_CLIENT_ID}
#     clientSecret: \${WRITE_CLIENT_SECRET}
#     tokenUrl: \${WRITE_TOKEN_URL}
#     cdfProjectName: \${WRITE_CDF_PROJECT_NAME}
#     # Optional: If idP requires providing the scopes
#     scopes:
#       - \${WRITE_SCOPES}
#     # Optional: If idP requires providing the audience
#     audience: \${WRITE_CDF_AUDIENCE}
# Or together like this:
# authentication:
#   clientId: \${CLIENT_ID}
#   clientSecret: \${CLIENT_SECRET}
#   tokenUrl: \${TOKEN_URL}
#   # Optional: If idP requires providing the scopes
#   cdfProjectName: \${CDF_PROJECT_NAME}
#   scopes:
#    - \${SCOPES}
#   # Optional: If idP requires providing the audience
#   audience: \${AUDIENCE}`,
};

export const DOC_TRANFORMATION_DETAIL =
  'https://docs.cognite.com/cdf/integration/guides/transformation/transformations.html';
export const DOC_TRANSFORMATION_SCHEDULE =
  'https://docs.cognite.com/cdf/integration/guides/transformation/transformations/#schedule-transformations';
export const DOC_TRANSFORMATION_CREDENTIALS =
  'https://docs.cognite.com/cdf/integration/guides/transformation/transformations/#schedule-transformations';

export const TRANSFORMATION_SURVEY_LINK =
  'https://cognite.getfeedback.com/r/RIxPJJT7';

export const MAPPING_MODE_MAGIC_STRING = 'MAPPING_MODE_ENABLED';

export const SQL_FORMATTER_OPTIONS: Partial<FormatFnOptions> = {
  language: 'spark',
  tabWidth: 2,
  linesBetweenQueries: 2,
};

export const FIVE_MINUTES = 5 * 60 * 1000;

export const RUN_BOX_SIZE = 24;
