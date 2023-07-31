import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';
import { getAuthHeaders, getProjectInfo } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import {
  SCHEMA_ID_MAP_CONFIG,
  SCHEMA_VERSION_MAP_CONFIG,
} from '../service/constants';

export type GeneralItem = {
  externalId: string;
  zoom: number;
  minimap: boolean;
  cluster: boolean;
  center: string;
};
type Response = {
  listgeneral: {
    items: GeneralItem[];
  };
};

export const getMapConfigGeneralBase = () => {
  const clientCogniteFDM = getCogniteClientFDM();
  const headers = getAuthHeaders();
  const [project] = getProjectInfo();

  return clientCogniteFDM.getQueryCreator<Response, unknown>({
    project,
    headers,
    cdfApiBaseUrl: SIDECAR.cdfApiBaseUrl,
    schemaName: SCHEMA_ID_MAP_CONFIG,
    schemaVersion: SCHEMA_VERSION_MAP_CONFIG,
  });
};

export const useFetchMapConfigGeneral = () => {
  const queryRunner = getMapConfigGeneralBase();

  return () =>
    queryRunner({
      query: `
      query ListGeneral {
        listgeneral {
          items {
            zoom
            minimap
            externalId
            cluster
            center
          }
        }
      }
    `,
    });
};
