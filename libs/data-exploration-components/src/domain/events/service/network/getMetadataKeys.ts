import { isProduction } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk';
import { extractMetadataKeys } from '../../../../utils/extractMetadataKeys';
import { getDataExplorerBackendEndpoint } from '../../../../utils/getDataExplorerBackendEndpoint';

export const getMetadataKeys = (sdk: CogniteClient) => {
  const apiUrl = getDataExplorerBackendEndpoint(
    sdk.project,
    sdk.getBaseUrl(),
    isProduction()
  );

  return fetch(`${apiUrl}/aggregates/events/metadata`, {
    headers: sdk.getDefaultRequestHeaders(),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.status.toString());
    })
    .catch(() => {
      // if this endpoint doesn't work or is not hosted on a specific cluster
      // fallback to the 1000 values
      return sdk.events
        .list({
          limit: 1000,
        })
        .then(response => {
          return extractMetadataKeys(response.items);
        });
    });
};
