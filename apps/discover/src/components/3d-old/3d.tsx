import React, { useEffect, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { ThemeProvider } from 'styled-components/macro';

import {
  NodeVisualizerProvider,
  SubSurfaceModule,
  Modules,
  ThreeModule,
  BPDataOptions,
  BaseRootNode,
} from '@cognite/node-visualizer';
import { Sequence, CogniteEvent } from '@cognite/sdk';

import { getSeismicSDKClient } from 'modules/seismicSearch/service';
import {
  TrajectoryRows,
  Well,
  WellboreNPTEventsMap,
} from 'modules/wellSearch/types';
import { mapCasingsTo3D } from 'modules/wellSearch/utils/3d/casings';
import { mapLogsTo3D } from 'modules/wellSearch/utils/3d/logs';
import { mapTrajectoriesTo3D } from 'modules/wellSearch/utils/3d/mapTrajectoriesTo3D';
import { mapTrajectoryDataTo3D } from 'modules/wellSearch/utils/3d/mapTrajectoryDataTo3D';
import { mapNDSTo3D } from 'modules/wellSearch/utils/3d/nds';
import { mapNPTTo3D } from 'modules/wellSearch/utils/3d/npt';
import { mapWellboresTo3D } from 'modules/wellSearch/utils/3d/wellbores';
import { mapWellsTo3D } from 'modules/wellSearch/utils/3d/wells';
import { ThreeDeeTheme } from 'styles/ThreeDeeTheme';

import { Toolbar } from './Toolbar';

export interface Props extends WellsData {
  fileId?: string;
}

interface WellsData {
  wells?: Well[];
  trajectories?: Sequence[];
  trajectoryData?: TrajectoryRows[];
  casings?: Sequence[];
  ndsEvents?: CogniteEvent[];
  nptEvents?: WellboreNPTEventsMap;
  logs?: any;
  logsFrmTops?: any;
}

const normalizeWellsData = (wellsData: WellsData): BPDataOptions => {
  const {
    wells = [],
    trajectories = [],
    trajectoryData = [],
    casings = [],
    ndsEvents = [],
    nptEvents = {},
    logs = {},
    // logsFrmTops = {},
  } = wellsData;

  const result: BPDataOptions = {
    wells: mapWellsTo3D(wells),
    wellBores: mapWellboresTo3D(wells),

    trajectories: mapTrajectoriesTo3D(trajectories),
    trajectoryData: mapTrajectoryDataTo3D(trajectoryData),
    casings: mapCasingsTo3D(casings),
    ndsEvents: mapNDSTo3D(ndsEvents),
    nptEvents: mapNPTTo3D(nptEvents, wells),
    logs: mapLogsTo3D(logs),
    // logsFrmTops,
  };

  // console.log('Normalize 3D result:', result);

  return result;
};

const ThreeDee: React.FC<Props> = ({
  wells,
  trajectories,
  trajectoryData,
  ndsEvents,
  nptEvents,
  casings,
  logs,
  logsFrmTops,
  fileId,
}) => {
  const [root, setRoot] = useState<BaseRootNode>();

  useEffect(() => {
    Modules.instance.clearModules();

    const modules = Modules.instance;
    modules.add(new ThreeModule());

    const subsurfaceModule = new SubSurfaceModule();

    if (fileId) {
      subsurfaceModule.addSeismicCube(getSeismicSDKClient(), fileId);
    }

    if (wells && !isEmpty(wells)) {
      subsurfaceModule.addWellData(
        normalizeWellsData({
          wells,
          trajectories,
          trajectoryData,
          casings,
          logs,
          logsFrmTops,
          ndsEvents,
          nptEvents,
        })
      );
    }

    modules.add(subsurfaceModule);

    modules.install();

    setRoot(modules.createRoot());
  }, [fileId, wells]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={ThreeDeeTheme}>
        {root && <NodeVisualizerProvider root={root} toolbar={Toolbar} />}
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default ThreeDee;
