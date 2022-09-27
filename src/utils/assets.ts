import { Asset, CogniteClient } from '@cognite/sdk';

export const getRootAsset = (
  sdk: CogniteClient,
  assetId: number
): Promise<Asset | undefined> => {
  return sdk.assets
    .retrieve(
      [
        {
          id: assetId,
        },
      ],
      { ignoreUnknownIds: true }
    )
    .then(res => {
      const asset = res[0];

      if (asset) {
        return sdk.assets
          .retrieve(
            [
              {
                id: asset.rootId,
              },
            ],
            { ignoreUnknownIds: true }
          )
          .then(response => {
            return response[0] || undefined;
          });
      }

      return undefined;
    });
};
