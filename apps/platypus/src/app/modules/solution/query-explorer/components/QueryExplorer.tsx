import { useState, useEffect } from 'react';
import GraphiQL from 'graphiql';
import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  GraphQLSchema,
  buildClientSchema,
  getIntrospectionQuery,
  IntrospectionQuery,
} from 'graphql';
import { QueryExplorerContainer } from './elements';
import { Notification } from '@platypus-app/components/Notification/Notification';
import graphQlQueryFetcher from '../utils/graphqlQueryFetcher';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

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
  const [gqlSchema, setGqlSchema] = useState<GraphQLSchema>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [explorerQuery, setExplorerQuery] = useState(defaultQuery);
  const [explorerVariables, setExplorerVariables] = useState('{}');
  const explorerPlugin = useExplorerPlugin({
    query: explorerQuery,
    onEdit: setExplorerQuery,
  });
  const { t } = useTranslation('SolutionQueryExplorer');

  const handleEditQuery = (query: string | undefined) =>
    setExplorerQuery(query);

  const handleEditVariables = (variables: string) =>
    setExplorerVariables(variables);

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
  }, [isReady, schemaVersion, dataModelExternalId, setIsReady]);

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
      ></GraphiQL>
    </QueryExplorerContainer>
  );
};
