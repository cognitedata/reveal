/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { PotreePointColorType  } from '@cognite/reveal';
import { registerVisualTest } from '../../../routes';
import { TestViewer } from '../TestViewer';

function DefaultPointCloudTestPage() {
  return (
    <TestViewer
      modelName="pointcloud-bunny"
      modelType="pointcloud"
      backgroundColor="#888888"
      pointColorType={PotreePointColorType.Height}
    />
  );
}

registerVisualTest('pointcloud', 'default', 'Default', <DefaultPointCloudTestPage />);
