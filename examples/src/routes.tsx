/*
 * Copyright 2020 Cognite AS
 */

import React, { ReactNode } from 'react';
import { Simple } from './pages/Simple';
import { DistanceMeasurement } from './pages/DistanceMeasurement';
import { SideBySide } from './pages/SideBySide';
import { Clipping } from './pages/Clipping';
import { Filtering } from './pages/Filtering';
import { GpuSectorCuller } from './pages/GpuSectorCuller';
import { Migration } from './pages/Migration';
import { Picking } from './pages/Picking';
import { SectorWithPointcloud } from './pages/SectorWithPointcloud';
import { SimplePointcloud } from './pages/SimplePointcloud';
import { SSAO } from './pages/SSAO';
import { TwoModels } from './pages/TwoModels';
import { WalkablePath } from './pages/WalkablePath';
import { Testable } from './pages/Testable';

type ExampleRoute = {
  path: string;
  menuTitle: string;
  component: ReactNode;
};

function getEnv(key: keyof typeof process.env) {
  return process.env[key] || '';
}

export const routes: Array<ExampleRoute> = [
  {
    path: '/simple',
    menuTitle: 'Simple',
    component: <Simple />,
  },
  {
    path: '/clipping',
    menuTitle: 'Clipping planes',
    component: <Clipping />,
  },
  {
    path: '/distance-measurement',
    menuTitle: 'Distance Measurement',
    component: <DistanceMeasurement />,
  },
  {
    path: '/filtering',
    menuTitle: 'Filtering',
    component: <Filtering />,
  },
  {
    path: '/gpu-sector-culler',
    menuTitle: 'GPU Sector Culler',
    component: <GpuSectorCuller />,
  },
  {
    path: `/migration?project=${getEnv('REACT_APP_PROJECT')}`,
    menuTitle: 'Migration',
    component: <Migration />,
  },
  {
    path: '/picking',
    menuTitle: 'Picking',
    component: <Picking />,
  },
  {
    path: `/sector-with-pointcloud?project=${getEnv(
      'REACT_APP_PROJECT'
    )}&model=${getEnv('REACT_APP_CAD_ID')}&pointCloud=${getEnv(
      'REACT_APP_POINTCLOUD_ID'
    )}`,
    menuTitle: 'Sector With Pointcloud',
    component: <SectorWithPointcloud />,
  },
  {
    path: `/side-by-side?project=${getEnv('REACT_APP_PROJECT')}&model2=${getEnv(
      'REACT_APP_CAD_2_ID'
    )}`,
    menuTitle: 'Side-by-side debugger for sector models',
    component: <SideBySide />,
  },
  {
    path: `/simple-point-cloud?project=${getEnv(
      'REACT_APP_PROJECT'
    )}&model=${getEnv('REACT_APP_POINTCLOUD_ID')}`,
    menuTitle: 'Simple Point Cloud',
    component: <SimplePointcloud />,
  },
  {
    path: '/ssao',
    menuTitle: 'Screen space ambient occlusion shading',
    component: <SSAO />,
  },
  {
    // not really good defaults, provide something more meaningful
    path: `/two-models?project=${getEnv('REACT_APP_PROJECT')}&model=${getEnv(
      'REACT_APP_CAD_ID'
    )}&model2=${getEnv('REACT_APP_CAD_2_ID')}`,
    menuTitle: 'Two models',
    component: <TwoModels />,
  },
  {
    path: '/walkable-path',
    menuTitle: 'Walkable Path',
    component: <WalkablePath />,
  },
  {
    path: '/testable',
    menuTitle: 'Automatically testable in CI',
    component: <Testable />,
  },
].sort((a, b) =>
  a.menuTitle < b.menuTitle ? -1 : a.menuTitle === b.menuTitle ? 0 : 1
);
