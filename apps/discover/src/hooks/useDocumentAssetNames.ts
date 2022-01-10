import { useQuery } from 'react-query';

import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export const useDocumentAssetNames = (assetIds: number[]) =>
  useQuery(['document_asset_names', assetIds], () => {
    if (assetIds.length > 0) {
      return getCogniteSDKClient()
        .assets.retrieve(assetIds.map((id) => ({ id })))
        .then((response) => response.map((row) => row.name));
    }
    return [];
  });
