import { useEffect, useMemo, useState } from 'react';

import { explorerPlugin } from '@graphiql/plugin-explorer';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { StorageProviderType } from '@platypus/platypus-core';
import GraphiQL from 'graphiql';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  IntrospectionQuery,
} from 'graphql';

import { Checkbox, Icon } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { Spinner } from '../../../../components/Spinner/Spinner';
import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { useMixpanel } from '../../../../hooks/useMixpanel';
import { GraphiqlStorageProvider } from '../utils/graphiqlStorageProvider';
import graphQlQueryFetcher from '../utils/graphqlQueryFetcher';

import { QueryExplorerContainer } from './elements';

type QueryExplorerType = {
  dataModelExternalId: string;
  space: string;
  schemaVersion: string;
  defaultQuery?: string;
  defaultVariables?: any;
  onQueryChange?: (newVar: { query: string; variables?: any }) => void;
};
const explorer = explorerPlugin({
  showAttribution: false,
  arrowClosed: <Icon type="ChevronDown" />,
  arrowOpen: <Icon type="ChevronUp" />,
  checkboxChecked: <Checkbox checked />,
  checkboxUnchecked: <Checkbox checked={false} />,
});

export const QueryExplorer = ({
  dataModelExternalId,
  schemaVersion,
  space,
  onQueryChange,
  defaultQuery,
  defaultVariables,
}: QueryExplorerType) => {
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
  const fdmClient = useInjection(TOKENS.fdmClient);
  const sdk = useSDK();
  const graphiqlStorageApi = useMemo(
    () =>
      new GraphiqlStorageProvider(
        space,
        dataModelExternalId,
        schemaVersion,
        localStorageProvider
      ),
    [localStorageProvider, schemaVersion, dataModelExternalId, space]
  );

  const [gqlSchema, setGqlSchema] = useState<GraphQLSchema>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [explorerQuery, handleEditQuery] = useState(defaultQuery);
  const [explorerVariables, handleEditVariables] = useState(
    JSON.stringify(defaultVariables || {}, null, 2)
  );
  const { track } = useMixpanel();

  const fetcher = useMemo(() => {
    return createGraphiQLFetcher({
      url: fdmClient.getQueryEndpointUrl({
        externalId: dataModelExternalId,
        version: schemaVersion,
        space,
      }),
      headers: sdk.getDefaultRequestHeaders(),
      fetch: (...params) => {
        track('DataModel.GraphIQL.Run');
        return fetch(...params);
      },
    });
  }, [
    track,
    sdk,
    sdk.getDefaultRequestHeaders(),
    fdmClient,
    dataModelExternalId,
    space,
    schemaVersion,
  ]);

  useEffect(() => {
    if (onQueryChange && explorerQuery) {
      try {
        const variables = JSON.parse(explorerVariables.trim() || '{}');
        onQueryChange({ query: explorerQuery, variables });
      } catch {
        //ignore
      }
    }
  }, [onQueryChange, explorerQuery, explorerVariables]);

  useEffect(() => {
    if (isReady || !dataModelExternalId || !schemaVersion) {
      return;
    }

    graphQlQueryFetcher
      .fetcher(
        {
          query: getIntrospectionQuery(),
          operationName: 'IntrospectionQuery',
        },
        dataModelExternalId,
        schemaVersion,
        space
      )
      .then((result: any) => {
        setIsReady(true);
        setGqlSchema(buildClientSchema(result as IntrospectionQuery));
      })
      .catch(() => {
        setIsReady(true);
      });
  }, [
    isReady,
    schemaVersion,
    dataModelExternalId,
    space,
    setIsReady,
    graphiqlStorageApi,
  ]);

  if (!isReady) {
    return <Spinner />;
  }

  return (
    <QueryExplorerContainer>
      <GraphiQL
        fetcher={fetcher}
        onEditQuery={handleEditQuery}
        onEditVariables={handleEditVariables}
        query={explorerQuery}
        schema={gqlSchema}
        plugins={[explorer]}
        isHeadersEditorEnabled={false}
        variables={explorerVariables}
        storage={graphiqlStorageApi}
      ></GraphiQL>
    </QueryExplorerContainer>
  );
};
