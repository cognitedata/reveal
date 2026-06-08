/*!
 * Copyright 2024 Cognite AS
 */

import type { QueryRequest, TableExpressionContainsAnyFilterV3 } from '@cognite/sdk';
import {
  pointCloudVolumeFilter,
  POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST,
  ASSET_PROPERTIES_LIST
} from './types';
import { getRevisionContainsAnyFilter } from './utils';
import {
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  COGNITE_ASSET_SOURCE
} from '../../utilities/constants';
import type { DMInstanceRef } from '@reveal/utilities';

const getDMPointCloudVolumeQuery = (revisionRef: DMInstanceRef): {
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
                readonly properties: ["revisions", "volumeReferences", "volumeType", "volume", "object3D"];
            }];
        };
        readonly object3D: {
            readonly sources: [];
        };
        readonly assets: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "object3D"];
            }];
        };
    };
} => {
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [pointCloudVolumeFilter, getRevisionContainsAnyFilter([revisionRef])]
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
            properties: POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST
          }
        ]
      },
      object3D: { sources: [] },
      assets: {
        sources: [
          {
            source: COGNITE_ASSET_SOURCE,
            properties: ASSET_PROPERTIES_LIST
          }
        ]
      }
    }
  } as const satisfies QueryRequest;
};

export type CdfDMPointCloudVolumeQuery = ReturnType<typeof getDMPointCloudVolumeQuery>;

export function getDMPointCloudVolumeCollectionQuery(
  revisionExternalId: string,
  space: string
): CdfDMPointCloudVolumeQuery {
  return getDMPointCloudVolumeQuery({ externalId: revisionExternalId, space });
}
