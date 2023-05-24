import { CogniteClient } from '@cognite/sdk';

export const getFileByStationId = (
  sdk: CogniteClient,
  stationId: string,
  face: string
) =>
  sdk.files
    .search({
      filter: {
        metadata: {
          station_id: stationId,
          face: face,
        },
      },
    })
    .then((files) => {
      if (!files.length) {
        return undefined;
      }
      return files;
    });
