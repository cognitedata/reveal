/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../visual_tests';

import { PotreePointColorType } from '@cognite/reveal';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function DefaultCognite3DViewerPointCloudTestPage() {
  const modelUrl = 'pointcloud-bunny';
  
  return <Cognite3DTestViewer modelUrls={[modelUrl]} pointCloudModelAddedCallback={(model) => {
    model.pointColorType = PotreePointColorType.Height;
  }}/>;
}

registerVisualTest('cad', 'default-cognite3dviewer-pointcloud', 'Default Cognite3DViewer PointCloud', <DefaultCognite3DViewerPointCloudTestPage />)
