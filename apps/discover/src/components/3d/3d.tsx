import React, { useEffect, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { ThemeProvider } from 'styled-components/macro';

import {
  NodeVisualizerProvider,
  SubSurfaceModule,
  ITrajectoryRows,
  Modules,
  ThreeModule,
  BPDataOptions,
  BaseRootNode,
} from '@cognite/node-visualizer';
import { Sequence, CogniteEvent } from '@cognite/sdk';

import { getSeismicSDKClient } from 'modules/seismicSearch/service';
import { ThreeDNPTEvents, Well } from 'modules/wellSearch/types';
import {
  mapWellboresToThreeD,
  mapWellsToThreeD,
  mapCasingsToThreeD,
} from 'modules/wellSearch/utils/threed';
import { ThreeDeeTheme } from 'styles/ThreeDeeTheme';

import { Toolbar } from './Toolbar';

export interface Props extends WellsData {
  fileId?: string;
}

interface WellsData {
  wells?: Well[];
  trajectories?: Sequence[];
  trajectoryData?: ITrajectoryRows[];
  casings?: Sequence[];
  ndsEvents?: CogniteEvent[];
  nptEvents?: ThreeDNPTEvents[];
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
    nptEvents = [],
    logs = {},
    // logsFrmTops = {},
  } = wellsData;

  const result: BPDataOptions = {
    wells: mapWellsToThreeD(wells),
    wellBores: mapWellboresToThreeD(wells),
    trajectories,
    trajectoryData,
    casings: mapCasingsToThreeD(casings),
    ndsEvents,
    nptEvents,
    logs,
    // logsFrmTops,
  };

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
    <ThemeProvider theme={ThreeDeeTheme}>
      {root && <NodeVisualizerProvider root={root} toolbar={Toolbar} />}
    </ThemeProvider>
  );
};

export default ThreeDee;
