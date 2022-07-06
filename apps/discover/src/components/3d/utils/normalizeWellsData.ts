import compact from 'lodash/compact';

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
    casings = [],
    ndsEvents = [],
    nptEvents = [],
    wellLogs = {},
  } = wellsData;

  /**
   * Casings data needs the wellbore name.
   * This is a temporary trick to get the wellbores list.
   * This will be fixed properly when 3D component is refactored to match with new domain types.
   */
  const wellbores = compact(wells.flatMap(({ wellbores }) => wellbores));

  const result: BPDataOptions = {
    wells: mapWellsTo3D(wells),
    wellBores: mapWellboresTo3D(wells),
    trajectories: mapTrajectoriesTo3D(trajectories),
    trajectoryData: mapTrajectoryDataTo3D(trajectories),
    casings: mapCasingsTo3D(wellbores, casings),
    ndsEvents: mapNDSTo3D(ndsEvents),
    nptEvents: mapNPTTo3D(nptEvents),
    logs: mapLogsTo3D(wellLogs),
  };

  // console.log('Normalize 3D result:', result);

  return result;
};
