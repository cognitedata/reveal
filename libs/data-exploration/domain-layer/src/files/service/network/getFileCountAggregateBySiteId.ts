import { CogniteClient } from '@cognite/sdk';

export const getFileCountAggregateBySiteId = (
  sdk: CogniteClient,
  siteId: string,
  face?: string
) =>
  sdk.files
    .aggregate({
      filter: {
        metadata: {
          site_id: siteId,
          ...(face && { face }),
        },
      },
    })
    .then((res) => {
      return res[0].count;
    });
