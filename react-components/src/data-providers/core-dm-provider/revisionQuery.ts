import { type QueryRequest } from '@cognite/sdk';
import { COGNITE_3D_REVISION_SOURCE, CORE_DM_3D_CONTAINER_SPACE } from './dataModels';
import { cogniteCadRevisionSourceWithProperties } from './cogniteCadRevisionSourceWithProperties';

export const revisionQuery: {
    readonly with: {
        readonly revision: {
            readonly nodes: {
                readonly filter: {
                    readonly and: [{
                        readonly equals: {
                            readonly property: ["cdf_cdm_3d", "Cognite3DRevision", "model3D"];
                            readonly value: {
                                readonly parameter: "modelReference";
                            };
                        };
                    }, {
                        readonly equals: {
                            readonly property: ["node", "externalId"];
                            readonly value: {
                                readonly parameter: "revisionExternalId";
                            };
                        };
                    }];
                };
            };
            readonly limit: 1;
        };
    }; readonly select: {
        readonly revision: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteCADRevision";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["status", "published", "type", "model3D", "revisionId"];
            }];
        };
    };
} = {
  with: {
    revision: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_3D_REVISION_SOURCE.externalId,
                  'model3D'
                ],
                value: { parameter: 'modelReference' }
              }
            },
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'revisionExternalId' }
              }
            }
          ]
        }
      },
      limit: 1
    }
  },
  select: {
    revision: {
      sources: cogniteCadRevisionSourceWithProperties
    }
  }
} as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;
