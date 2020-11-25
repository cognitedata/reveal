/*
 * Copyright 2020 Cognite AS
 */

import React, { ReactNode } from 'react';
import { Simple } from './pages/Simple';
import { DistanceMeasurement } from './pages/DistanceMeasurement';
import { SideBySide } from './pages/SideBySide';
import { Clipping } from './pages/Clipping';
import { Filtering } from './pages/Filtering';
import { Migration } from './pages/Migration';
import { Picking } from './pages/Picking';
import { SectorWithPointcloud } from './pages/SectorWithPointcloud';
import { SimplePointcloud } from './pages/SimplePointcloud';
import { SSAO } from './pages/SSAO';
import { TwoModels } from './pages/TwoModels';
import { WalkablePath } from './pages/WalkablePath';
import { Testable } from './pages/Testable';
import { WebGLTwo } from './pages/WebGLTwo';

// if you want to test your latest changes in workers or rust files
// copy your worker files to some folder in /public and specify the path below
// parser-worker has `yarn local-cdn` to set it up quickly
// notice that experimental is separate entry point so it required to override env for it too

// import { revealEnv } from '@cognite/reveal';
// import { revealEnv as revealEnv2 } from '@cognite/reveal/experimental'
// revealEnv.publicPath = `${process.env.PUBLIC_URL}/local-cdn/`;
// revealEnv2.publicPath = `${process.env.PUBLIC_URL}/local-cdn/`;

type ExampleRoute = {
  path: string;
  menuTitle: string;
  component: ReactNode;
};

function getEnv(key: keyof typeof process.env) {
  return process.env[key] || '';
}

const project = getEnv('REACT_APP_PROJECT');
const cadId = getEnv('REACT_APP_CAD_ID');
const cadRevisionId = getEnv('REACT_APP_CAD_REVISION_ID');
const cad2Id = getEnv('REACT_APP_CAD_2_ID');
const cad2RevisionId = getEnv('REACT_APP_CAD_2_REVISION_ID');
const pointCloudId = getEnv('REACT_APP_POINTCLOUD_ID');
const pointCloudRevisionId = getEnv('REACT_APP_POINTCLOUD_REVISION_ID');

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
    path:
      `/migration?project=${project}` +
      `&modelId=${cadId}` +
      `&revisionId=${cadRevisionId}`,
    menuTitle: 'Migration',
    component: <Migration />,
  },
  {
    path: '/picking',
    menuTitle: 'Picking',
    component: <Picking />,
  },
  {
    path:
      `/sector-with-pointcloud?project=${project}` +
      `&modelId=${cadId}` +
      `&revisionId=${cadRevisionId}` +
      `&pointCloudModelId=${pointCloudId}` +
      `&pointCloudRevisionId=${pointCloudRevisionId}`,
    menuTitle: 'Sector With Pointcloud',
    component: <SectorWithPointcloud />,
  },
  {
    path:
      `/side-by-side?project=${project}` +
      `&modelId=${cadId}&revisionId=${cadRevisionId}` +
      `&modelId2=${cad2Id}&revisionId2=${cad2RevisionId}`,
    menuTitle: 'Side-by-side debugger for sector models',
    component: <SideBySide />,
  },
  {
    path: `/simple-point-cloud?project=${project}&modelId=${pointCloudId}&revisionId=${pointCloudRevisionId}`,
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
    path:
      `/two-models?project=${project}` +
      `&modelId=${cadId}&revisionId=${cadRevisionId}` +
      `&modelId2=${cad2Id}&revisionId2=${cad2RevisionId}`,
    menuTitle: 'Two models',
    component: <TwoModels />,
  },
  {
    path: '/walkable-path',
    menuTitle: 'Walkable Path',
    component: <WalkablePath />,
  },
  {
    path: '/webgltwo',
    menuTitle: 'WebGL 2.0',
    component: <WebGLTwo />,
  },
  {
    path: '/testable',
    menuTitle: 'Automatically testable in CI',
    component: <Testable />,
  },
].sort((a, b) =>
  a.menuTitle < b.menuTitle ? -1 : a.menuTitle === b.menuTitle ? 0 : 1
);
