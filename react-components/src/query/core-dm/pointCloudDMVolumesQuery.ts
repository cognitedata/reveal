import { TableExpressionContainsAnyFilterV3, type QueryRequest } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import {
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  COGNITE_ASSET_SOURCE
} from '../../data-providers/core-dm-provider/dataModels';
import {
  isPointCloudVolumeFilter,
  getRevisionContainsAnyFilter
} from '../../data-providers/core-dm-provider/utils/filters';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pointCloudDMVolumesQuery = (revisionRefs: DmsUniqueIdentifier[]): {
    readonly with: {
        readonly pointCloudVolumes: {
            readonly nodes: {
                readonly filter: {
                    readonly and: [{
                        readonly hasData: [{
                            readonly externalId: "CognitePointCloudVolume";
                            readonly space: "cdf_cdm";
                            readonly version: "v1";
                            readonly type: "view";
                        }];
                    }, TableExpressionContainsAnyFilterV3];
                };
            };
            readonly limit: 1000;
        };
        readonly object3D: {
            readonly nodes: {
                readonly from: "pointCloudVolumes";
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
            readonly limit: 1000;
        };
        readonly assets: {
            readonly nodes: {
                readonly from: "object3D";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteVisualizable";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
            };
            readonly limit: 1000;
        };
    }; readonly select: {
        readonly pointCloudVolumes: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CognitePointCloudVolume";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["volumeReferences", "object3D", "revisions", "volumeType", "volume"];
            }];
        };
        readonly object3D: {};
        readonly assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["object3D", "name", "description"];
            }];
        };
    };
} => {
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [
              isPointCloudVolumeFilter,
              getRevisionContainsAnyFilter([
                {
                  externalId: revisionRefs[0].externalId,
                  space: revisionRefs[0].space
                }
              ])
            ]
          }
        },
        limit: 1000
      },
      object3D: {
        nodes: {
          from: 'pointCloudVolumes',
          through: {
            view: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
            identifier: 'object3D'
          },
          direction: 'outwards'
        },
        limit: 1000
      },
      assets: {
        nodes: {
          from: 'object3D',
          through: {
            view: COGNITE_VISUALIZABLE_SOURCE,
            identifier: 'object3D'
          }
        },
        limit: 1000
      }
    },
    select: {
      pointCloudVolumes: {
        sources: [
          {
            source: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
            properties: ['volumeReferences', 'object3D', 'revisions', 'volumeType', 'volume']
          }
        ]
      },
      object3D: {},
      assets: {
        sources: [
          {
            source: COGNITE_ASSET_SOURCE,
            properties: ['object3D', 'name', 'description']
          }
        ]
      }
    }
  } as const satisfies QueryRequest;
};
