import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { ThemeProvider } from 'styled-components/macro';

import {
  NodeVisualizerProvider,
  SubSurfaceModule,
  Modules,
  ThreeModule,
  BaseRootNode,
} from '@cognite/node-visualizer';

import { useDeepEffect } from 'hooks/useDeep';
import { getSeismicSDKClient } from 'modules/seismicSearch/service';
import { ThreeDeeTheme } from 'styles/ThreeDeeTheme';

import { Toolbar } from './Toolbar';
import { ThreeDeeProps } from './types';
import { normalizeWellsData } from './utils/normalizeWellsData';

const ThreeDee: React.FC<ThreeDeeProps> = ({
  wells,
  trajectories,
  trajectoryData,
  ndsEvents,
  nptEvents,
  casings,
  wellLogs,
  wellLogsRowData,
  fileId,
}) => {
  const [root, setRoot] = useState<BaseRootNode>();

  useDeepEffect(() => {
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
          wellLogs,
          wellLogsRowData,
          ndsEvents,
          nptEvents,
        })
      );
    }

    modules.add(subsurfaceModule);

    modules.install();

    setRoot(modules.createRoot());
  }, [fileId, wells, wellLogs]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={ThreeDeeTheme}>
        {root && <NodeVisualizerProvider root={root} toolbar={Toolbar} />}
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default ThreeDee;
