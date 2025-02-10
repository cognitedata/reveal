/*!
 * Copyright 2024 Cognite AS
 */

import { type InternalId } from '@cognite/sdk';
import { type ModelWithAssetMappings } from '../../../hooks/cad/ModelWithAssetMappings';
import { useMemo } from 'react';
import { uniqBy } from 'lodash';
import { isDefined } from '../../../utilities/isDefined';

export const useExtractUniqueAssetIdsFromMapped: (
  assetMappings: ModelWithAssetMappings[] | undefined
) => InternalId[] = (assetMappings: ModelWithAssetMappings[] | undefined) => {
  return useMemo(() => {
    const mappings = assetMappings?.map((item) => item.assetMappings).flat() ?? [];
    const assetIds: InternalId[] = mappings
      .flatMap((item) => {
        return {
          id: item.assetId
        };
      })
      .filter((assetId) => isDefined(assetId.id));
    const uniqueAssetIds = uniqBy(assetIds, (assetId) => assetId.id);
    return uniqueAssetIds;
  }, [assetMappings]);
};
