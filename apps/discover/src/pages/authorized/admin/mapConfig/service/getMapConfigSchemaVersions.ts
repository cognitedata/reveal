import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

export const getMapConfigSchemaVersions = async () => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  const response = await clientCogniteFDM.list.versions({
    client: clientCognite,
  });

  if ('data' in response) {
    return response.data.listApis.items;
  }

  return [];
};
