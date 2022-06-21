import { getAuthHeaders, getProjectInfo } from '@cognite/react-container';
import { GraphQLClient } from 'graphql-request';
import SIDECAR from 'utils/sidecar';

export const graphqlFetcher = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  headers?: RequestInit['headers']
) => {
  const [project] = getProjectInfo();
  const urlBase = SIDECAR.cdfApiBaseUrl;
  const url = `${urlBase}/api/v1/projects/${project}/schema/api/cognite_office_explorer/1/graphql`;

  const graphQLClient = new GraphQLClient(url, {
    headers: {
      Authorization: getAuthHeaders().Authorization,
    },
  });

  return async (): Promise<TData> =>
    graphQLClient.request<TData, TVariables>(query, variables, headers);
};
