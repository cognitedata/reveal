import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { getAuthHeaders, getProjectInfo } from '@cognite/react-container';
import SIDECAR from 'utils/sidecar';
import React from 'react';

export const ApolloProviderWrapper: React.FC<React.PropsWithChildren<unknown>> =
  ({ children }) => {
    const [project] = getProjectInfo();
    const urlBase = SIDECAR.cdfApiBaseUrl;
    const headers = {
      Authorization: getAuthHeaders().Authorization,
    };

    const url = `${urlBase}/api/v1/projects/${project}/schema/api/cognite_office_explorer/1/graphql`;
    const apolloClient = new ApolloClient({
      uri: url,
      headers,
      cache: new InMemoryCache(),
    });

    return <ApolloProvider client={apolloClient}> {children}</ApolloProvider>;
  };
