import { CogniteClient, CursorResponse, IdEither } from '@cognite/sdk';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

type Payload = {
  resourceType: SdkResourceType;
  resourceId: IdEither;
};

type BaseCdfItemProps = OneOf<{
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
      const item = data.items[0];

      if (item?.assetId) {
        return [item.assetId];
      }
      if (item?.assetIds) {
        return item.assetIds;
      }
      return [] as number[];
    })
    .catch(() => {
      return [] as number[];
    });
};
