/*
 * Copyright 2021 Cognite AS
 */

import React, { ReactNode } from 'react';
import { Simple } from './pages/Simple';
import { Clipping } from './pages/Clipping';
import { Migration } from './pages/Migration';
import { SectorWithPointcloud } from './pages/SectorWithPointcloud';
import { SimplePointcloud } from './pages/SimplePointcloud';
import { SSAO } from './pages/SSAO';
import { TwoModels } from './pages/TwoModels';
import { WalkablePath } from './pages/WalkablePath';

const cadTestBasePath = '/test/cad/';
const pointcloudTestBasePath = '/test/pointcloud/';

// if you want to test your latest changes in workers or rust files
// copy your worker files to some folder in /public and specify the path below
// parser-worker has `yarn local-cdn` to set it up quickly
// notice that experimental is separate entry point so it required to override env for it too

// import { revealEnv } from '@cognite/reveal';
// import { revealEnv as revealEnv2 } from '@cognite/reveal/internals'

// revealEnv.publicPath = `${process.env.PUBLIC_URL}/local-cdn/`;
// revealEnv2.publicPath = `${process.env.PUBLIC_URL}/local-cdn/`;

export type ExampleRoute = {
  name: string;
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

function menuTitleAz(a: ExampleRoute, b: ExampleRoute): number {
  return a.menuTitle < b.menuTitle ? -1 : a.menuTitle === b.menuTitle ? 0 : 1;
}

export const exampleRoutes: Array<ExampleRoute> = [
  {
    name: 'simple',
    path: '/simple',
    menuTitle: 'Simple',
    component: <Simple />,
  },
  {
    name: 'clipping',
    path: '/clipping',
    menuTitle: 'Clipping planes',
    component: <Clipping />,
  },
  {
    name: 'default',
    path:
      `/migration?project=${project}` +
      `&modelId=${cadId}` +
      `&revisionId=${cadRevisionId}`,
    menuTitle: 'Default',
    component: <Migration />,
  },
  {
    name: 'cad-pointcloud',
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
    name: 'pointcloud',
    path: `/simple-point-cloud?project=${project}&modelId=${pointCloudId}&revisionId=${pointCloudRevisionId}`,
    menuTitle: 'Simple Point Cloud',
    component: <SimplePointcloud />,
  },
  {
    name: 'ssao',
    path: '/ssao',
    menuTitle: 'Screen space ambient occlusion shading',
    component: <SSAO />,
  },
  {
    name: 'two-models',
    // not really good defaults, provide something more meaningful
    path:
      `/two-models?project=${project}` +
      `&modelId=${cadId}&revisionId=${cadRevisionId}` +
      `&modelId2=${cad2Id}&revisionId2=${cad2RevisionId}`,
    menuTitle: 'Two models',
    component: <TwoModels />,
  },
  {
    name: 'walkable-path',
    path: '/walkable-path',
    menuTitle: 'Walkable Path',
    component: <WalkablePath />,
  },
].sort(menuTitleAz);

const cadTestPages: Record<string, { testDescription: string, testPage: JSX.Element }> = {};
const pointcloudTestPages: Record<string, { testDescription: string, testPage: JSX.Element }> = {};

export function registerVisualTest(
  category: 'cad' | 'pointcloud', 
  testKey: string, 
  testDescription: string, 
  testPage: JSX.Element) {

  switch (category) {
    case 'cad':
      cadTestPages[testKey] = { testDescription, testPage };
      break;

    case 'pointcloud':
      pointcloudTestPages[testKey] = { testDescription, testPage };
      break;

    default:
      throw new Error(`Unknown test category: '${category}'`);
  }
}

export const cadTestRoutes: Array<ExampleRoute> = 
  Object.entries(cadTestPages).map(([testName, test]) => {
    return {
      name: testName,
      path: cadTestBasePath + testName,
      menuTitle: test.testDescription,
      component: test.testPage
    };
  }).sort((x, y) => x.menuTitle.localeCompare(y.menuTitle));

export const pointCloudTestRoutes: Array<ExampleRoute> = 
  Object.entries(pointcloudTestPages).map(([testName, test]) => {
    return {
      name: testName,
      path: pointcloudTestBasePath + testName,
      menuTitle: test.testDescription,
      component: test.testPage
    };
  }).sort((x, y) => x.menuTitle.localeCompare(y.menuTitle));


// Register all visual tests
const context = require.context('./pages/e2e', true, /\.tsx$/);
context.keys().forEach((key) => {
  context(key);
});
