/*!
 * Copyright 2024 Cognite AS
 */

import { InstanceFilter, Source } from "../FdmSDK";
import { COGNITE_ASSET_SOURCE } from "./dataModels";

export function cadCogniteAssetsInstanceFilterWithtHasDataQuery(
  sourcesToSearch: Source[],
): InstanceFilter {
  return {
    and: [
      {
        hasData: [
          {
            type: 'view',
            externalId: sourcesToSearch[0]?.externalId,
            space: sourcesToSearch[0]?.space,
            version: sourcesToSearch[0]?.version,
          },
        ],
      },
      {
        exists: {
          property: [
            COGNITE_ASSET_SOURCE.space,
            `${COGNITE_ASSET_SOURCE.externalId}/${COGNITE_ASSET_SOURCE.version}`,
            'object3D',
          ],
        },
      },
      {
        exists: {
          property: [
            sourcesToSearch[0]?.space,
            `${sourcesToSearch[0]?.externalId}/${sourcesToSearch[0]?.version}`,
            'object3D',
          ],
        },
      },
    ],
  };

}
