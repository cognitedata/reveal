import navigation from 'constants/navigation';

export const MAX_3D_WELLBORES_COUNT = 20;

export const NO_WELLBORE_ERROR_MESSAGE = `No wellbores are selected. At least one wellbore has to be selected.`;
export const NO_LOGS_ERROR_MESSAGE = `No logs are selected. At least one log has to be selected.`;
export const NO_LOGS_LEGEND_MESSAGE = `No data available`;
export const EMPTY_LOGS_MESSAGE = 'No Well Logs Found To Display';
export const EMPTY_PPFGS_MESSAGE = 'PPFGs not found for selected wellbores';
export const EMPTY_GEOMECHANICS_MESSAGE =
  'Geomechanics not found for selected wellbores';
export const EMPTY_CHART_DATA_MESSAGE = 'Chart Data Not Found';
export const DEVELOPMENT_INPROGRESS = 'Development In Progress';
export const MAX_WELLBORES_ERROR_MESSAGE = `Selected wellbores count cannot exceed ${MAX_3D_WELLBORES_COUNT}`;

export const COMMON_COLUMN_ACCESSORS = {
  WELL_NAME: 'metadata.wellName',
  WELLBORE_NAME: 'metadata.wellboreName',
};

export const COMMON_COLUMN_WIDTHS = {
  WELL_NAME: 300,
  WELLBORE_NAME: 250,
};

export const TOP_BAR_HEIGHT = 68; // px

export const TAB_ITEMS = [
  {
    key: 'overview',
    name: 'Overview',
    path: navigation.SEARCH_WELLS_INSPECT_OVERVIEW,
  },
  {
    key: 'trajectory',
    name: 'Trajectories',
    path: navigation.SEARCH_WELLS_INSPECT_TRAJECTORY,
  },
  {
    key: 'nds',
    name: 'NDS Events',
    path: navigation.SEARCH_WELLS_INSPECT_EVENTSNDS,
  },
  {
    key: 'npt',
    name: 'NPT Events',
    path: navigation.SEARCH_WELLS_INSPECT_EVENTSNPT,
  },
  {
    key: 'casing',
    name: 'Casings',
    path: navigation.SEARCH_WELLS_INSPECT_CASINGSCOMPLETIONS,
  },
  {
    key: 'logs',
    name: 'Well logs',
    path: navigation.SEARCH_WELLS_INSPECT_LOGTYPE,
  },
  {
    key: 'relatedDocument',
    name: 'Related Documents',
    path: navigation.SEARCH_WELLS_INSPECT_RELATEDDOCUMENTS,
  },
  {
    key: 'digitalRocks',
    name: 'Digital Rocks',
    path: navigation.SEARCH_WELLS_INSPECT_DIGITALROCKS,
  },
  {
    key: 'geomechanic',
    name: 'Geomechanic',
    path: navigation.SEARCH_WELLS_INSPECT_GEOMECHANIC,
  },
  {
    key: 'multiplePPFG',
    name: 'Multiple PPFG',
    path: navigation.SEARCH_WELLS_INSPECT_MULTIPLEPPFG,
    standalone: true,
  },
  {
    key: 'threeDee',
    name: '3D',
    path: navigation.SEARCH_WELLS_INSPECT_THREEDEE,
    standalone: true,
  },
];
