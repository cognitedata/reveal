import type { ViewItem } from '../../../../src/data-providers/FdmSDK';

export const viewImplementingCogniteAsset: ViewItem = {
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
