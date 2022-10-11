import { useState, useEffect, useRef } from 'react';
import GraphiQL, { FetcherParams } from 'graphiql';
import 'graphiql/graphiql.min.css';
import GraphiQLExplorer from 'graphiql-explorer';
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
  const graphiql = useRef<GraphiQL>(null);
  const [gqlSchema, setGqlSchema] = useState<GraphQLSchema>();
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [explorerQuery, setExplorerQuery] = useState(defaultQuery);
  const { t } = useTranslation('SolutionQueryExplorer');

  const handleToggleExplorer = () => setIsExplorerOpen(!isExplorerOpen);

  const handleEditQuery = (query: string | undefined) =>
    setExplorerQuery(query);

  useEffect(() => {
    if (isReady || !solutionId || !schemaVersion) {
      return;
    }

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
      {
        <GraphiQLExplorer
          title={t('query_explorer_title', 'Query Explorer')}
          schema={gqlSchema}
          query={explorerQuery}
          onEdit={handleEditQuery}
          explorerIsOpen={isExplorerOpen}
          onToggleExplorer={handleToggleExplorer}
        />
      }
      {/* TODO: Update graphiql package to fix ts errors */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <GraphiQL
        ref={graphiql}
        fetcher={(graphQlParams: FetcherParams) =>
          graphQlQueryFetcher.fetcher(graphQlParams, solutionId, schemaVersion)
        }
        onEditQuery={handleEditQuery}
        query={explorerQuery}
        schema={gqlSchema}
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
