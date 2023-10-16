import head from 'lodash/head';

import { CogniteClient, CursorResponse, IdEither } from '@cognite/sdk';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

type Payload = {
  resourceType: SdkResourceType;
  resourceId: IdEither;
};

type BaseCdfItemProps = OneOf<{
  id?: number;
  assetId?: number;
  assetIds?: number[];
}>;

export const getAssetIds = <T extends BaseCdfItemProps>(
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceId, resourceType } = payload;

  return sdk
    .post<CursorResponse<T[]>>(
      `/api/v1/projects/${sdk.project}/${resourceType}/byids`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          items: [resourceId],
          ignoreUnknownIds: true,
        },
      }
    )
    .then(({ data }) => {
      const item = head(data.items);

      // If resource type is asset itself, we return its id
      if (resourceType === 'assets' && item?.id) {
        return [item.id];
      }

      // For resources which can be directly linked to only one asset
      if (item?.assetId) {
        return [item.assetId];
      }

      // For resources which can be directly linked to multiple assets
      if (item?.assetIds) {
        return item.assetIds;
      }

      return [] as number[];
    })
    .catch(() => {
      return [] as number[];
    });
};
