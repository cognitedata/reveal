import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
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
};

export const QueryExplorer = ({
  dataModelExternalId,
  schemaVersion,
  space,
  defaultQuery,
}: QueryExplorerType) => {
  const { t } = useTranslation('SolutionQueryExplorer');
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

  const explorerPlugin = useExplorerPlugin({
    schema: gqlSchema,
    query: explorerQuery,
    onEdit: handleEditQuery,
  });

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
      .catch((error: any) => {
        setIsReady(true);
        Notification({
          type: 'error',
          message: error.message,
        });
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
        fetcher={(graphQlParams) =>
          graphQlQueryFetcher.fetcher(
            graphQlParams,
            dataModelExternalId,
            schemaVersion,
            space
          )
        }
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
