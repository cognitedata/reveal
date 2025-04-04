/*!
 * Copyright 2024 Cognite AS
 */
import { describe, expect, it } from 'vitest';
import { type NodeItem, type ViewItem } from '../FdmSDK';
import { getCogniteAssetDirectRelationProperties } from './getCogniteAssetDirectRelationProperties';

describe(getCogniteAssetDirectRelationProperties.name, () => {
  it('Should find direct relation properties which are of type asset', () => {
    const node: NodeItem<Record<string, unknown>> = {
      instanceType: 'node',
      version: 16,
      space: 'test3d',
      externalId: 'custom_asset_1',
      createdTime: 1738170192924,
      lastUpdatedTime: 1743161596936,
      properties: {
        test3d: {
          'CustomAsset/v1': {
            path: [
              {
                space: 'test3d',
                externalId: 'custom_asset_1'
              }
            ],
            root: {
              space: 'test3d',
              externalId: 'custom_asset_2'
            },
            parent: {
              space: 'test3d',
              externalId: 'custom_asset_3'
            },
            pathLastUpdatedTime: '2025-03-28T11:33:16.936314+00:00',
            name: 'AssetName',
            object3D: {
              space: 'test3d',
              externalId: '63ed91e0-ba2b-4e33-a510-2aa1d4143fb3'
            }
          }
        }
      }
    };

    const result = getCogniteAssetDirectRelationProperties(node, viewImplementingCogniteAsset);
    expect(result.length).toBe(2);
  });

  it('Should return nothing if DR property is not found', () => {
    const node: NodeItem<Record<string, unknown>> = {
      instanceType: 'node',
      version: 16,
      space: 'test3d',
      externalId: 'custom_asset_1',
      createdTime: 1738170192924,
      lastUpdatedTime: 1743161596936,
      properties: {
        test3d: {
          'CustomAsset/v1': {
            name: 'AssetName'
          },
          root: {
            space: 'test3d',
            externalId: 'custom_asset_1'
          }
        }
      }
    };

    const result = getCogniteAssetDirectRelationProperties(node, viewImplementingCogniteAsset);
    expect(result.length).toBe(0);
  });

  it('Should return nothing if DR points to itself', () => {
    const node: NodeItem<Record<string, unknown>> = {
      instanceType: 'node',
      version: 16,
      space: 'test3d',
      externalId: 'custom_asset_1',
      createdTime: 1738170192924,
      lastUpdatedTime: 1743161596936,
      properties: {
        test3d: {
          'CustomAsset/v1': {
            name: 'AssetName'
          }
        }
      }
    };

    const result = getCogniteAssetDirectRelationProperties(node, viewImplementingCogniteAsset);
    expect(result.length).toBe(0);
  });
});

const viewImplementingCogniteAsset: ViewItem = {
  externalId: 'CustomAsset',
  space: 'test3d',
  version: 'v1',
  createdTime: 1737550314381,
  lastUpdatedTime: 1741955820145,
  writable: true,
  usedFor: 'node',
  isGlobal: false,
  properties: {
    object3D: {
      type: {
        type: 'direct',
        list: false,
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'Cognite3DObject',
          version: 'v1'
        }
      },
      container: {
        type: 'container',
        space: 'cdf_cdm',
        externalId: 'CogniteVisualizable'
      },
      containerPropertyIdentifier: 'object3D',
      immutable: false,
      nullable: true,
      autoIncrement: false,
      description: 'Direct relation to an Object3D instance representing the 3D resource'
    },
    source: {
      type: {
        type: 'direct',
        container: {
          type: 'container',
          space: 'cdf_cdm',
          externalId: 'CogniteSourceSystem'
        },
        list: false,
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'CogniteSourceSystem',
          version: 'v1'
        }
      },
      container: {
        type: 'container',
        space: 'cdf_cdm',
        externalId: 'CogniteSourceable'
      },
      containerPropertyIdentifier: 'source',
      immutable: false,
      nullable: true,
      autoIncrement: false,
      description: 'Direct relation to a source system'
    },
    parent: {
      type: {
        type: 'direct',
        list: false,
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'CogniteAsset',
          version: 'v1'
        }
      }
    },
    root: {
      type: {
        type: 'direct',
        list: false,
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'CogniteAsset',
          version: 'v1'
        }
      },
      container: {
        type: 'container',
        space: 'cdf_cdm',
        externalId: 'CogniteAsset'
      },
      containerPropertyIdentifier: 'assetHierarchy_root',
      immutable: false,
      nullable: true,
      autoIncrement: false,
      description: 'An automatically updated reference to the top-level asset of the hierarchy.',
      name: 'Root'
    },
    path: {
      type: {
        type: 'direct',
        list: true,
        maxListSize: 100,
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'CogniteAsset',
          version: 'v1'
        }
      },
      container: {
        type: 'container',
        space: 'cdf_cdm',
        externalId: 'CogniteAsset'
      },
      containerPropertyIdentifier: 'assetHierarchy_path',
      immutable: false,
      nullable: true,
      autoIncrement: false,
      description:
        "An automatically updated ordered list of this asset's ancestors, starting with the root asset. Enables subtree filtering to find all assets under a parent.",
      name: 'Path'
    },
    type: {
      type: {
        type: 'direct',
        container: {
          type: 'container',
          space: 'cdf_cdm',
          externalId: 'CogniteAssetType'
        },
        list: false,
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'CogniteAssetType',
          version: 'v1'
        }
      },
      container: {
        type: 'container',
        space: 'cdf_cdm',
        externalId: 'CogniteAsset'
      },
      containerPropertyIdentifier: 'type',
      immutable: false,
      nullable: true,
      autoIncrement: false,
      description: "Specifies the type of the asset. It's a direct relation to CogniteAssetType.",
      name: 'Asset type'
    },
    children: {
      connectionType: 'multi_reverse_direct_relation',
      source: {
        type: 'view',
        space: 'cdf_cdm',
        externalId: 'CogniteAsset',
        version: 'v1'
      },
      through: {
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'CogniteAsset',
          version: 'v1'
        },
        identifier: 'parent'
      },
      targetsList: false,
      name: 'Children',
      description: 'An automatically updated list of assets with this asset as their parent.'
    },
    timeSeries: {
      connectionType: 'multi_reverse_direct_relation',
      source: {
        type: 'view',
        space: 'cdf_cdm',
        externalId: 'CogniteTimeSeries',
        version: 'v1'
      },
      through: {
        source: {
          type: 'view',
          space: 'cdf_cdm',
          externalId: 'CogniteTimeSeries',
          version: 'v1'
        },
        identifier: 'assets'
      },
      targetsList: true,
      name: 'Time series',
      description: 'An automatically updated list of time series related to the asset.'
    },
    CustomName: {
      type: {
        type: 'text',
        list: false,
        collation: 'ucs_basic'
      },
      container: {
        type: 'container',
        space: 'test3d',
        externalId: 'CustomAsset'
      },
      containerPropertyIdentifier: 'CustomName',
      immutable: false,
      nullable: false,
      autoIncrement: false
    }
  },
  name: 'CustomAsset',
  implements: [
    {
      type: 'view',
      space: 'cdf_cdm',
      externalId: 'CogniteAsset',
      version: 'v1'
    }
  ]
};
