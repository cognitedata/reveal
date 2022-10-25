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
  solutionId: string;
  schemaVersion: string;
  defaultQuery?: string;
};

export const QueryExplorer = ({
  solutionId,
  schemaVersion,
  defaultQuery,
}: QueryExplorerType) => {
  const [gqlSchema, setGqlSchema] = useState<GraphQLSchema>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [explorerQuery, setExplorerQuery] = useState(defaultQuery);
  const explorerPlugin = useExplorerPlugin({
    query: explorerQuery,
    onEdit: setExplorerQuery,
  });
  const { t } = useTranslation('SolutionQueryExplorer');

  const handleEditQuery = (query: string | undefined) =>
    setExplorerQuery(query);

  useEffect(() => {
    if (isReady || !solutionId || !schemaVersion) {
      return;
    }

    localStorage.setItem('graphiql:theme', 'light');

    graphQlQueryFetcher
      .fetcher(
        {
          query: getIntrospectionQuery(),
          operationName: 'IntrospectionQuery',
        },
        solutionId,
        schemaVersion
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
  }, [isReady, schemaVersion, solutionId, setIsReady]);

  if (!isReady) {
    return <Spinner />;
  }

  return (
    <QueryExplorerContainer>
      <GraphiQL
        fetcher={(graphQlParams) =>
          graphQlQueryFetcher.fetcher(graphQlParams, solutionId, schemaVersion)
        }
        onEditQuery={handleEditQuery}
        query={explorerQuery}
        schema={gqlSchema}
        plugins={[explorerPlugin]}
      ></GraphiQL>
    </QueryExplorerContainer>
  );
};
