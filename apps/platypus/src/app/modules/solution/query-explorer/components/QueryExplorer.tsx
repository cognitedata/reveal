import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { StorageProviderType } from '@platypus/platypus-core';
import GraphiQL from 'graphiql';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  IntrospectionQuery,
} from 'graphql';
import { useEffect, useMemo, useState } from 'react';
import { GraphiqlStorageProvider } from '../utils/graphiqlStorageProvider';
import graphQlQueryFetcher from '../utils/graphqlQueryFetcher';
import { QueryExplorerContainer } from './elements';

type QueryExplorerType = {
  dataModelExternalId: string;
  space: string;
  schemaVersion: string;
  defaultQuery?: string;
  onQueryChange?: (query?: string) => void;
};

export const QueryExplorer = ({
  dataModelExternalId,
  schemaVersion,
  space,
  onQueryChange,
  defaultQuery,
}: QueryExplorerType) => {
  const { t } = useTranslation('query_explorer');
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
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
  const [explorerVariables, handleEditVariables] = useState('{}');
  const { track } = useMixpanel();

  const explorerPlugin = useExplorerPlugin({
    schema: gqlSchema,
    query: explorerQuery || '',
    onEdit: handleEditQuery,
    showAttribution: false,
  });

  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(explorerQuery);
    }
  }, [onQueryChange, explorerQuery]);

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
        fetcher={(graphQlParams) => {
          return graphQlQueryFetcher
            .fetcher(graphQlParams, dataModelExternalId, schemaVersion, space)
            .then((data) => {
              track('DataModel.GraphIQL.Run');
              return data;
            })
            .catch((e) => {
              // there are other places that handles errors.
              // need to remove this when fully migrated to V3
              return {
                message: t(
                  'failed_to_fetch_results',
                  'Failed to fetch query result'
                ),
                error: e,
              };
            });
        }}
        onEditQuery={handleEditQuery}
        onEditVariables={handleEditVariables}
        query={explorerQuery}
        schema={gqlSchema}
        plugins={[explorerPlugin]}
        isHeadersEditorEnabled={false}
        variables={explorerVariables}
        storage={graphiqlStorageApi}
      ></GraphiQL>
    </QueryExplorerContainer>
  );
};
