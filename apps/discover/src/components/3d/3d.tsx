import React, { useEffect, useState } from 'react';

import {
  NodeVisualizerProvider,
  SubSurfaceModule,
  Modules,
  ThreeModule,
} from '@cognite/node-visualizer';
import { Sequence, CogniteEvent } from '@cognite/sdk';
import {
  Wellbore,
  Well,
  Trajectory,
  TrajectoryRows,
} from '@cognite/subsurface-interfaces';

import { getSeismicSDKClient } from 'modules/seismicSearch/service';
import { ThemeProvider } from 'styles/ThemeProvider';
import { ThreeDeeTheme } from 'styles/ThreeDeeTheme';

export interface Props extends WellsData {
  fileId?: string;
}

interface WellsData {
  wells?: Well[];
  wellBores?: Wellbore[];
  trajectories?: Trajectory[];
  trajectoryData?: TrajectoryRows[];
  casings?: Sequence[];
  ndsEvents?: CogniteEvent[];
  nptEvents?: CogniteEvent[];
  logs?: any;
  logsFrmTops?: any;
}

const normalizeWellsData = (wellsData: WellsData): WellsData => {
  const {
    wells = [],
    wellBores = [],
    trajectories = [],
    trajectoryData = [],
    casings = [],
    ndsEvents = [],
    nptEvents = [],
    logs = {},
    logsFrmTops = {},
  } = wellsData;

  return {
    wells,
    wellBores,
    trajectories,
    trajectoryData,
    casings,
    ndsEvents,
    nptEvents,
    logs,
    logsFrmTops,
  };
};

const ThreeDee: React.FC<Props> = ({
  wells,
  wellBores,
  trajectories,
  trajectoryData,
  ndsEvents,
  nptEvents,
  casings,
  logs,
  logsFrmTops,
  fileId,
}) => {
  const [root, setRoot] = useState();

  useEffect(() => {
    Modules.instance.clearModules();

    const modules = Modules.instance;
    modules.add(new ThreeModule());

    const subsurfaceModule = new SubSurfaceModule();

    if (fileId) {
      subsurfaceModule.addSeismicCube(getSeismicSDKClient(), fileId);
    }

    if (wells && wells.length > 0) {
      subsurfaceModule.addWellData(
        normalizeWellsData({
          wells,
          wellBores,
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
    <ThemeProvider theme={ThreeDeeTheme}>
      <NodeVisualizerProvider root={root} />
    </ThemeProvider>
  );
};

export default ThreeDee;
