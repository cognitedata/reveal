import React from 'react';

import { AssetInfo } from './AssetInfo';
import { assetsFixture, threeDModels } from '@data-exploration-lib/core';

const sdkMock = {
  models3D: {
    retrieve: async (modelId: number) => {
      return threeDModels.find(({ id: testId }) => testId === modelId);
    },
  },
};

export default {
  title: 'Assets/AssetInfo',
  component: AssetInfo,
  parameters: {
    explorerConfig: { sdkMockOverride: sdkMock },
  },
};

export const ExampleWithoutLinked3DModel = () => (
  <AssetInfo asset={assetsFixture[0]} />
);

export const ExampleWithOneLinked3DModel = () => (
  <AssetInfo asset={assetsFixture[1]} />
);

export const ExampleWithTwoLinked3DModel = () => (
  <AssetInfo asset={assetsFixture[2]} />
);
