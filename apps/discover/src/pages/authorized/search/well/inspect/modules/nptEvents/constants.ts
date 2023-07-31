import { ViewModes } from 'pages/authorized/search/common/types';

export const accessors = {
  WELL_NAME: 'wellName',
  WELLBORE_NAME: 'wellboreName',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  MEASURED_DEPTH: 'measuredDepth.value',
  DURATION: 'duration',
  NPT_CODE: 'nptCode',
  NPT_DETAIL_CODE: 'nptCodeDetail',
  DESCRIPTION: 'description',
  ROOT_CAUSE: 'rootCause',
  LOCATION: 'location',
  NPT_LEVEL: 'nptLevel',
  SUBTYPE: 'subtype',
};

export const DEFAULT_ACTIVE_VIEW_MODE = ViewModes.Graph;
