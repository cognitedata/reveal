/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { PotreePointColorType  } from '@cognite/reveal';
import { TestViewer } from '../TestViewer';

export function DefaultPointCloudTestPage() {
  return (
    <TestViewer
      modelName="pointcloud-bunny"
      modelType="pointcloud"
      backgroundColor="#888888"
      pointColorType={PotreePointColorType.Height}
    />
  );
}
