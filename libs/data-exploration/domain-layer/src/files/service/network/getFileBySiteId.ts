import { CogniteClient } from '@cognite/sdk';

export const getFileBySiteId = (
  sdk: CogniteClient,
  siteId: string,
  face: string
) =>
  sdk.files
    .search({
      filter: {
        metadata: {
          site_id: siteId,
          face: face,
        },
      },
    })
    .then((files) => {
      if (!files.length) {
        return undefined;
      }
      return files[0];
    });
