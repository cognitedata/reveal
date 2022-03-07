export enum TAB_NAMES {
  OVERVIEW = 'Overview',
  TRAJECTORIES = 'Trajectories',
  NDS_EVENTS = 'NDS Events',
  NPT_EVENTS = 'NPT Events',
  CASINGS = 'Casings',
  WELL_LOGS = 'Well Logs',
  RELATED_DOCUMENTS = 'Related Documents',
  DIGITAL_ROCKS = 'Digital Rocks',
  GEOMECHANICS_PPFG = 'Geomechanics & PPFG',
  THREE_DEE = '3D',
}

export type WellInspectTabs = TAB_NAMES;

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
  WELL_NAME: '300px',
  WELLBORE_NAME: '250px',
};

export const TOP_BAR_HEIGHT = 68; // px

export const WARNING_MODAL_EXPLANATION =
  '3D is currently optimised for viewing 10 wellbores or fewer. Viewing more than 10 wellbores may cause performance problems.';
export const WARNING_MODAL_QUESTION =
  'Do you want to proceed with the current selection?';
export const WARNING_MODAL_TITLE = 'Notice';
