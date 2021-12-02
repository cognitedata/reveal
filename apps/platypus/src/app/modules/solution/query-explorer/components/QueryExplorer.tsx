import { useState, useEffect, useRef } from 'react';
import GraphiQL, { Fetcher } from 'graphiql';
import 'graphiql/graphiql.min.css';
import GraphiQLExplorer from 'graphiql-explorer';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import {
  GraphQLSchema,
  IntrospectionQuery,
  buildClientSchema,
  getIntrospectionQuery,
} from 'graphql';
import { QueryExplorerContainer } from './elements';

type QueryExplorerType = {
  apiUrl: string;
  defaultQuery?: string;
};

async function fetchGraphQlSchema(fetcher: Fetcher) {
  const result = await fetcher({
    query: getIntrospectionQuery(),
    operationName: 'IntrospectionQuery',
  });

  const schema = buildClientSchema(
    (result as { data: IntrospectionQuery }).data
  );
  return schema;
}

export const QueryExplorer = ({ apiUrl, defaultQuery }: QueryExplorerType) => {
  const graphiql = useRef<GraphiQL>(null);
  const [gqlSchema, setGqlSchema] = useState<GraphQLSchema>();
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [explorerQuery, setExplorerQuery] = useState(defaultQuery);
  const { t } = useTranslation('SolutionQueryExplorer');

  const handleToggleExplorer = () => setIsExplorerOpen(!isExplorerOpen);

  const handleEditQuery = (query: string | undefined) =>
    setExplorerQuery(query);

  const fetcher = createGraphiQLFetcher({
    url: apiUrl,
  });

  useEffect(() => {
    fetchGraphQlSchema(fetcher)
      .then((result: GraphQLSchema) => {
        setGqlSchema(result);
      })
      .catch((error) => {
        console.log(error);
        Notification({
          type: 'error',
          message: error.message,
        });
      });
  }, [apiUrl]);

  return (
    <QueryExplorerContainer>
      <GraphiQLExplorer
        title={t('query_explorer_title', 'Query Explorer')}
        schema={gqlSchema}
        query={explorerQuery}
        onEdit={handleEditQuery}
        explorerIsOpen={isExplorerOpen}
        onToggleExplorer={handleToggleExplorer}
      />
      <GraphiQL
        ref={graphiql}
        fetcher={fetcher}
        onEditQuery={handleEditQuery}
        query={explorerQuery}
      >
        <GraphiQL.Toolbar>
          <GraphiQL.Button
            onClick={() => graphiql.current?.handlePrettifyQuery()}
            label={t('query_explorer_prettify_btn', 'Prettify')}
            title={t(
              'query_explorer_prettify_title_btn',
              'Prettify Query (Shift-Ctrl-P)'
            )}
          />
          <GraphiQL.Button
            onClick={() => graphiql.current?.handleCopyQuery()}
            label={t('query_explorer_copy_btn', 'Copy')}
            title={t(
              'query_explorer_copy_title_btn',
              'Copy Query (Shift-Ctrl-C)'
            )}
          />
          <GraphiQL.Button
            onClick={() => graphiql.current?.handleToggleHistory()}
            label={t('query_explorer_history_btn', 'History')}
            title={t('query_explorer_history_title_btn', 'Show History')}
          />
          <GraphiQL.Button
            onClick={handleToggleExplorer}
            label={t('query_explorer_btn', 'Explorer')}
            title={t('query_explorer_title_btn', 'Toggle Explorer')}
          />
        </GraphiQL.Toolbar>
      </GraphiQL>
    </QueryExplorerContainer>
  );
};
