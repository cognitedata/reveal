/*!
 * Copyright 2024 Cognite AS
 */

import { useMemo } from 'react';
import { isDefined } from '../utilities/isDefined';
import { convertAssetMetadataKeysToLowerCase } from '../utilities/convertAssetMetadataToLowerCase';
import { type Asset } from '@cognite/sdk';

export const useConvertAssetMetadatasToLowerCase = (assets: Asset[] | undefined): Asset[] => {
  const convertedAssetNodesWithLowerCasedMetadata = useMemo(() => {
    const convertedAssetNodes = assets?.filter(isDefined).map(convertAssetMetadataKeysToLowerCase);

    return convertedAssetNodes ?? [];
  }, [assets]);

  return convertedAssetNodesWithLowerCasedMetadata;
};
