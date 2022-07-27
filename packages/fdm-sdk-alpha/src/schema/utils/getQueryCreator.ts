import { GraphQLClient } from 'graphql-request';

type Error = {
  error: {
    code: number;
    message: string;
  };
};

/**
 * Usage example:
 *
 *

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

*
*/
export const getQueryCreator = <TData, TVariables>({
  project,
  schemaVersion,
  schemaName,
  cdfApiBaseUrl,
  headers,
}: {
  cdfApiBaseUrl: string;
  schemaVersion: string;
  schemaName: string;
  project: string;

  headers?: RequestInit['headers'];
}) => {
  const url = `${cdfApiBaseUrl}/api/v1/projects/${project}/schema/api/${schemaName}/${schemaVersion}/graphql`;

  const graphQLClient = new GraphQLClient(url, {
    headers,
  });

  return ({
    query,
    variables,
  }: {
    query: string;
    variables?: TVariables;
  }): Promise<TData | Error> =>
    graphQLClient.request<TData, TVariables>(query, variables, headers);
};
