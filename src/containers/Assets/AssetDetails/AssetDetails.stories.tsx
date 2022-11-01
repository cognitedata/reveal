import React from 'react';
import { assets } from 'stubs/assets';
import { AssetDetails } from './AssetDetails';

const sdkMock = {
  models3D: {
    list: () => ({
      autoPagingToArray: async () => [
        {
          name: 'Test Model',
          id: 10000,
          createdTime: new Date(1667225500643),
        },
        {
          name: 'Test Model 2',
          id: 10001,
          createdTime: new Date(1667225500643),
        },
      ],
    }),
  },
  revisions3D: {
    list: () => ({
      autoPagingToArray: async () => [
        {
          id: 20000,
          fileId: 30000,
          published: true,
          status: 'Done',
          assetMappingCount: 1,
          createdTime: new Date(1667225500643),
        },
      ],
    }),
  },
  assetMappings3D: {
    list: (modelId: number) => ({
      autoPagingToArray: async () => [
        {
          treeIndex: 10,
          subtreeSize: 11,
          nodeId: 12,
          assetId: 4731838049650567,
        },
        ...(modelId === 10001
          ? [
              {
                treeIndex: 10,
                subtreeSize: 11,
                nodeId: 12,
                assetId: 8026188205449529,
              },
            ]
          : []),
      ],
    }),
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
