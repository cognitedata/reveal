/*!
 * Copyright 2025 Cognite AS
 */
import type { HasExistingDataFilterV3, TableExpressionDataModelsBoolFilter } from '@cognite/sdk';
import { CORE_DM_3D_REVISION_VIEW_REFERENCE, CORE_DM_IMAGE_360_VIEW_REFERENCE } from './sources';
import { CORE_DM_3D_CONTAINER_SPACE } from '../../utilities/constants';

export const isCoreDmImage360CollectionFilter: {
    readonly and: [{
        hasData: {
            readonly type: "view";
            readonly space: "cdf_cdm";
            readonly externalId: "Cognite3DRevision";
            readonly version: "v1";
        }[];
    }, {
        readonly equals: {
            readonly property: ["cdf_cdm_3d", "Cognite3DRevision", "type"];
            readonly value: "Image360";
        };
    }];
} = {
  and: [
    {
      hasData: [CORE_DM_3D_REVISION_VIEW_REFERENCE]
    } satisfies HasExistingDataFilterV3,
    {
      equals: {
        property: [CORE_DM_3D_CONTAINER_SPACE, 'Cognite3DRevision', 'type'],
        value: 'Image360'
      }
    }
  ]
} as const satisfies TableExpressionDataModelsBoolFilter;

export const isCoreDmImage360Filter: {
    readonly hasData: [{
        readonly type: "view";
        readonly space: "cdf_cdm";
        readonly externalId: "Cognite360Image";
        readonly version: "v1";
    }];
} = {
  hasData: [CORE_DM_IMAGE_360_VIEW_REFERENCE]
} as const satisfies HasExistingDataFilterV3;
