import { CogniteClient, CursorResponse, IdEither } from '@cognite/sdk';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

type Payload = {
  resourceType: SdkResourceType;
  resourceId: IdEither;
};

type BaseCdfItemProps = OneOf<{
  assetId?: string;
  assetIds?: string[];
}>;

export const getAssetIdsCount = <T extends BaseCdfItemProps>(
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
        return 1;
      }

      if (item?.assetIds) {
        return item.assetIds.length;
      }

      return 0;
    })
    .catch(() => {
      return 0;
    });
};
