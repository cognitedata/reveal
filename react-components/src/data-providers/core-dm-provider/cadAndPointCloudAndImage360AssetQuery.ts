import { type TableExpressionLeafFilter, type QueryRequest, TableExpressionFilterDefinition } from '@cognite/sdk';
import { type Source, type InstanceFilter, type DmsUniqueIdentifier } from '../FdmSDK';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';
import {
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE,
  COGNITE_IMAGE_360_SOURCE,
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_IMAGE_360_ANNOTATION_SOURCE,
  COGNITE_3D_REVISION_SOURCE
} from './dataModels';

const containsCadRevisionFilter = {
  containsAny: {
    property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_CAD_NODE_SOURCE.externalId, 'revisions'],
    values: { parameter: 'revisionRefs' }
  }
} as const satisfies InstanceFilter;

const containsPointCloudRevisionFilter = {
  containsAny: {
    property: [
      CORE_DM_3D_CONTAINER_SPACE,
      COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
      'revisions'
    ],
    values: { parameter: 'revisionRefs' }
  }
} as const satisfies InstanceFilter;

function containsImage360CollectionFilter(revisionRefs: DmsUniqueIdentifier[]): InstanceFilter {
  return {
    and: [
      { instanceReferences: revisionRefs } as unknown as TableExpressionLeafFilter,
      {
        hasData: [COGNITE_3D_REVISION_SOURCE]
      },
      {
        equals: {
          property: ['cdf_cdm_3d', 'Cognite3DRevision', 'type'],
          value: 'Image360'
        }
      }
    ]
  } as const;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function cadAndPointCloudAndImage36AssetQuery(
  sourcesToSearch: Source[],
  revisionRefs: DmsUniqueIdentifier[],
  filter: InstanceFilter | undefined,
  limit: number
): {
    readonly with: {
        readonly cad_nodes: {
            readonly nodes: {
                readonly filter: {
                    readonly containsAny: {
                        readonly property: ["cdf_cdm_3d", "CogniteCADNode", "revisions"];
                        readonly values: {
                            readonly parameter: "revisionRefs";
                        };
                    };
                };
            };
            readonly limit: number;
        };
        readonly cad_object_3d: {
            readonly nodes: {
                readonly from: "cad_nodes";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteCADNode";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "outwards";
            };
            readonly limit: number;
        };
        readonly cad_assets: {
            readonly nodes: {
                readonly from: "cad_object_3d";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "inwards";
                readonly filter: TableExpressionFilterDefinition | undefined;
            };
            readonly limit: number;
        };
        readonly pointcloud_volumes: {
            readonly nodes: {
                readonly filter: {
                    readonly containsAny: {
                        readonly property: ["cdf_cdm_3d", "CognitePointCloudVolume", "revisions"];
                        readonly values: {
                            readonly parameter: "revisionRefs";
                        };
                    };
                };
            };
            readonly limit: number;
        };
        readonly pointcloud_object_3d: {
            readonly nodes: {
                readonly from: "pointcloud_volumes";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CognitePointCloudVolume";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "outwards";
            };
            readonly limit: number;
        };
        readonly pointcloud_assets: {
            readonly nodes: {
                readonly from: "pointcloud_object_3d";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly filter: TableExpressionFilterDefinition | undefined;
            };
            readonly limit: number;
        };
        readonly image360_collections: {
            readonly nodes: {
                readonly filter: TableExpressionFilterDefinition;
            };
            readonly limit: number;
        };
        readonly image360_revisions: {
            readonly nodes: {
                readonly from: "image360_collections";
                readonly through: {
                    readonly view: {
                        readonly externalId: "Cognite360Image";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "collection360";
                };
                readonly direction: "inwards";
            };
            readonly limit: number;
        };
        readonly image360_annotations: {
            readonly edges: {
                readonly from: "image360_revisions";
                readonly direction: "inwards";
                readonly filter: {
                    readonly hasData: [{
                        readonly externalId: "Cognite360ImageAnnotation";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    }];
                };
            };
            readonly limit: number;
        };
        readonly image360_object3ds: {
            readonly nodes: {
                readonly from: "image360_annotations";
                readonly chainTo: "destination";
                readonly filter: {
                    readonly hasData: [{
                        readonly externalId: "Cognite3DObject";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    }];
                };
            };
            readonly limit: number;
        };
        readonly image360_assets: {
            readonly nodes: {
                readonly from: "image360_object3ds";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "inwards";
                readonly filter: {
                    readonly hasData: [{
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    }];
                };
            };
            readonly limit: number;
        };
    }; readonly select: {
        readonly cad_nodes: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteCADNode";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["*"];
            }];
        };
        readonly cad_assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "tags", "aliases", "object3D", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "parent", "root", "path", "pathLastUpdatedTime", "equipment", "assetClass", "type", "files", "children", "activities", "timeSeries"];
            }, ...{
                source: Source;
                properties: string[];
            }[]];
        };
        readonly pointcloud_assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "tags", "aliases", "object3D", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "parent", "root", "path", "pathLastUpdatedTime", "equipment", "assetClass", "type", "files", "children", "activities", "timeSeries"];
            }, ...{
                source: Source;
                properties: string[];
            }[]];
        };
        readonly image360_assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "tags", "aliases", "object3D", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "parent", "root", "path", "pathLastUpdatedTime", "equipment", "assetClass", "type", "files", "children", "activities", "timeSeries"];
            }, ...{
                source: Source;
                properties: string[];
            }[]];
        };
    };
} {
  return {
    with: {
      cad_nodes: {
        nodes: {
          filter: containsCadRevisionFilter
        },
        limit
      },
      cad_object_3d: {
        nodes: {
          from: 'cad_nodes',
          through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        },
        limit
      },
      cad_assets: {
        nodes: {
          from: 'cad_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter
        },
        limit
      },
      pointcloud_volumes: {
        nodes: {
          filter: containsPointCloudRevisionFilter
        },
        limit
      },
      pointcloud_object_3d: {
        nodes: {
          from: 'pointcloud_volumes',
          through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        },
        limit
      },
      pointcloud_assets: {
        nodes: {
          from: 'pointcloud_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          filter
        },
        limit
      },
      image360_collections: {
        nodes: {
          filter: containsImage360CollectionFilter(revisionRefs)
        },
        limit
      },
      image360_revisions: {
        nodes: {
          from: 'image360_collections',
          through: { view: COGNITE_IMAGE_360_SOURCE, identifier: 'collection360' },
          direction: 'inwards'
        },
        limit
      },
      image360_annotations: {
        edges: {
          from: 'image360_revisions',
          direction: 'inwards',
          filter: { hasData: [COGNITE_IMAGE_360_ANNOTATION_SOURCE] }
        },
        limit
      },
      image360_object3ds: {
        nodes: {
          from: 'image360_annotations',
          chainTo: 'destination',
          filter: { hasData: [COGNITE_3D_OBJECT_SOURCE] }
        },
        limit
      },
      image360_assets: {
        nodes: {
          from: 'image360_object3ds',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter: { hasData: [COGNITE_ASSET_SOURCE] }
        },
        limit
      }
    },
    select: {
      cad_nodes: {
        sources: [
          {
            source: COGNITE_CAD_NODE_SOURCE,
            properties: ['*']
          }
        ]
      },
      cad_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      },
      pointcloud_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      },
      image360_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursors'>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function cadAssetQueryPayload(
  sourcesToSearch: Source[],
  filter: InstanceFilter | undefined,
  limit: number
): {
    readonly with: {
        readonly cad_nodes: {
            readonly nodes: {
                readonly filter: {
                    readonly containsAny: {
                        readonly property: ["cdf_cdm_3d", "CogniteCADNode", "revisions"];
                        readonly values: {
                            readonly parameter: "revisionRefs";
                        };
                    };
                };
            };
            readonly limit: number;
        };
        readonly cad_object_3d: {
            readonly nodes: {
                readonly from: "cad_nodes";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteCADNode";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "outwards";
            };
            readonly limit: number;
        };
        readonly cad_assets: {
            readonly nodes: {
                readonly from: "cad_object_3d";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "inwards";
                readonly filter: TableExpressionFilterDefinition | undefined;
            };
            readonly limit: number;
        };
    }; readonly select: {
        readonly cad_nodes: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteCADNode";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["*"];
            }];
        };
        readonly cad_assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "tags", "aliases", "object3D", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "parent", "root", "path", "pathLastUpdatedTime", "equipment", "assetClass", "type", "files", "children", "activities", "timeSeries"];
            }, ...{
                source: Source;
                properties: string[];
            }[]];
        };
    };
} {
  return {
    with: {
      cad_nodes: {
        nodes: {
          filter: containsCadRevisionFilter
        },
        limit
      },
      cad_object_3d: {
        nodes: {
          from: 'cad_nodes',
          through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        },
        limit
      },
      cad_assets: {
        nodes: {
          from: 'cad_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter
        },
        limit
      }
    },
    select: {
      cad_nodes: {
        sources: [
          {
            source: COGNITE_CAD_NODE_SOURCE,
            properties: ['*']
          }
        ]
      },
      cad_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursors'>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function pointCloudsAssetsQueryPayload(
  sourcesToSearch: Source[],
  filter: InstanceFilter | undefined,
  limit: number
): {
    readonly with: {
        readonly pointcloud_volumes: {
            readonly nodes: {
                readonly filter: {
                    readonly containsAny: {
                        readonly property: ["cdf_cdm_3d", "CognitePointCloudVolume", "revisions"];
                        readonly values: {
                            readonly parameter: "revisionRefs";
                        };
                    };
                };
            };
            readonly limit: number;
        };
        readonly pointcloud_object_3d: {
            readonly nodes: {
                readonly from: "pointcloud_volumes";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CognitePointCloudVolume";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "outwards";
            };
            readonly limit: number;
        };
        readonly pointcloud_assets: {
            readonly nodes: {
                readonly from: "pointcloud_object_3d";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly filter: TableExpressionFilterDefinition | undefined;
            };
            readonly limit: number;
        };
    }; readonly select: {
        readonly pointcloud_assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "tags", "aliases", "object3D", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "parent", "root", "path", "pathLastUpdatedTime", "equipment", "assetClass", "type", "files", "children", "activities", "timeSeries"];
            }, ...{
                source: Source;
                properties: string[];
            }[]];
        };
    };
} {
  return {
    with: {
      pointcloud_volumes: {
        nodes: {
          filter: containsPointCloudRevisionFilter
        },
        limit
      },
      pointcloud_object_3d: {
        nodes: {
          from: 'pointcloud_volumes',
          through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        },
        limit
      },
      pointcloud_assets: {
        nodes: {
          from: 'pointcloud_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          filter
        },
        limit
      }
    },
    select: {
      pointcloud_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursors'>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function image360AssetsQueryPayload(
  sourcesToSearch: Source[],
  revisionRefs: DmsUniqueIdentifier[],
  filter: InstanceFilter | undefined,
  limit: number
): {
    readonly with: {
        readonly image360_collections: {
            readonly nodes: {
                readonly filter: TableExpressionFilterDefinition;
            };
            readonly limit: number;
        };
        readonly image360_revisions: {
            readonly nodes: {
                readonly from: "image360_collections";
                readonly through: {
                    readonly view: {
                        readonly externalId: "Cognite360Image";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "collection360";
                };
                readonly direction: "inwards";
            };
            readonly limit: number;
        };
        readonly image360_annotations: {
            readonly edges: {
                readonly from: "image360_revisions";
                readonly direction: "inwards";
                readonly filter: {
                    readonly hasData: [{
                        readonly externalId: "Cognite360ImageAnnotation";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    }];
                };
            };
            readonly limit: number;
        };
        readonly image360_object3ds: {
            readonly nodes: {
                readonly from: "image360_annotations";
                readonly chainTo: "destination";
                readonly filter: {
                    readonly hasData: [{
                        readonly externalId: "Cognite3DObject";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    }];
                };
            };
            readonly limit: number;
        };
        readonly image360_assets: {
            readonly nodes: {
                readonly from: "image360_object3ds";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "inwards";
                readonly filter: TableExpressionFilterDefinition | undefined;
            };
            readonly limit: number;
        };
    }; readonly select: {
        readonly image360_assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "tags", "aliases", "object3D", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "parent", "root", "path", "pathLastUpdatedTime", "equipment", "assetClass", "type", "files", "children", "activities", "timeSeries"];
            }, ...{
                source: Source;
                properties: string[];
            }[]];
        };
    };
} {
  return {
    with: {
      image360_collections: {
        nodes: {
          filter: containsImage360CollectionFilter(revisionRefs)
        },
        limit
      },
      image360_revisions: {
        nodes: {
          from: 'image360_collections',
          through: { view: COGNITE_IMAGE_360_SOURCE, identifier: 'collection360' },
          direction: 'inwards'
        },
        limit
      },
      image360_annotations: {
        edges: {
          from: 'image360_revisions',
          direction: 'inwards',
          filter: { hasData: [COGNITE_IMAGE_360_ANNOTATION_SOURCE] }
        },
        limit
      },
      image360_object3ds: {
        nodes: {
          from: 'image360_annotations',
          chainTo: 'destination',
          filter: { hasData: [COGNITE_3D_OBJECT_SOURCE] }
        },
        limit
      },
      image360_assets: {
        nodes: {
          from: 'image360_object3ds',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter
        },
        limit
      }
    },
    select: {
      image360_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursors'>;
}
