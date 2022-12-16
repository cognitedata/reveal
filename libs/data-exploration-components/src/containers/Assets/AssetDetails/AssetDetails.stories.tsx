import React from 'react';
import { assets } from '@data-exploration-components/stubs/assets';
import { threeDModels } from '@data-exploration-components/stubs/threeDModels';
import { AssetDetails } from './AssetDetails';

const sdkMock = {
  models3D: {
    retrieve: async (modelId: number) => {
      return threeDModels.find(({ id: testId }) => testId === modelId);
    },
  },
};

export default {
  title: 'Assets/AssetDetails',
  component: AssetDetails,
  parameters: {
    explorerConfig: { sdkMockOverride: sdkMock },
  },
};

export const ExampleWithoutLinked3DModel = () => (
  <AssetDetails asset={assets[0]} />
);

export const ExampleWithOneLinked3DModel = () => (
  <AssetDetails asset={assets[1]} />
);

export const ExampleWithTwoLinked3DModel = () => (
  <AssetDetails asset={assets[2]} />
);
