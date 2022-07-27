import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

import {
  MODEL_ID_GENERAL,
  SCHEMA_ID_MAP_CONFIG,
  SCHEMA_VERSION_MAP_CONFIG,
  SPACE_ID,
} from './constants';

const graphQl = `
  type ${MODEL_ID_GENERAL} @view {
      center: String
      zoom: Int
      cluster: Boolean
      minimap: Boolean
  }
`;

export const createMapConfigSchema = async () => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  await clientCogniteFDM.create.schema({
    client: clientCognite,
    schemaDefinition: {
      description: '',
      externalId: SCHEMA_ID_MAP_CONFIG,
      name: 'Map Config',
    },
  });

  await clientCogniteFDM.create.version({
    client: clientCognite,
    version: {
      version: SCHEMA_VERSION_MAP_CONFIG,
      apiExternalId: SCHEMA_ID_MAP_CONFIG,
      graphQl,
      bindings: [
        {
          targetName: MODEL_ID_GENERAL,
          dataModelStorageSource: {
            space: SPACE_ID,
            externalId: MODEL_ID_GENERAL,
          },
        },
      ],
    },
  });
};
