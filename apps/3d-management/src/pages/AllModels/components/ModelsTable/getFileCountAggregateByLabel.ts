import { QueryFunctionContext } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk/dist/src';

const getFileCountAggregateByLabel = (
  sdk: CogniteClient,
  siteId: string,
  finishedLabel: string
) =>
  sdk.files
    .aggregate({
      filter: {
        metadata: {
          site_id: siteId,
        },
        labels: {
          containsAny: [{ externalId: finishedLabel }],
        },
      },
    })
    .then((res) => {
      return res[0].count;
    });

export const getFileCountAggregateByLabelQuery = async ({
  queryKey,
}: QueryFunctionContext<[string, CogniteClient, string, string]>) => {
  const [_key, sdk, siteId, label] = queryKey;
  return await getFileCountAggregateByLabel(sdk, siteId, label);
};
