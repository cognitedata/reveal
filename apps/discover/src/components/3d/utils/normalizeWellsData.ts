import { BPDataOptions } from '@cognite/node-visualizer';

import { WellsData } from '../types';

import { mapCasingsTo3D } from './casings';
import { mapLogsTo3D } from './logs';
import { mapNDSTo3D } from './nds';
import { mapNPTTo3D } from './npt';
import { mapTrajectoriesTo3D } from './trajectories';
import { mapTrajectoryDataTo3D } from './trajectoryData';
import { mapWellboresTo3D } from './wellbores';
import { mapWellsTo3D } from './wells';

export const normalizeWellsData = (wellsData: WellsData): BPDataOptions => {
  const {
    wells = [],
    trajectories = [],
    trajectoryData = [],
    casings = [],
    ndsEvents = [],
    nptEvents = {},
    wellLogs = {},
    wellLogsRowData = {},
  } = wellsData;

  const result: BPDataOptions = {
    wells: mapWellsTo3D(wells),
    wellBores: mapWellboresTo3D(wells),
    trajectories: mapTrajectoriesTo3D(trajectories),
    trajectoryData: mapTrajectoryDataTo3D(trajectoryData),
    casings: mapCasingsTo3D(casings),
    ndsEvents: mapNDSTo3D(ndsEvents),
    nptEvents: mapNPTTo3D(nptEvents, wells),
    logs: mapLogsTo3D(wellLogs, wellLogsRowData),
  };

  // console.log('Normalize 3D result:', result);

  return result;
};
