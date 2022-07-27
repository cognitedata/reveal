import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

export const getMapConfigSchemas = async () => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  const response = await clientCogniteFDM.list.schemas({
    client: clientCognite,
  });

  if ('data' in response) {
    const nodes = response.data.listApis.edges;
    return nodes.map(({ node }) => node.externalId);
  }

  return [];
};
