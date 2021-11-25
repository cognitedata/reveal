import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';

import { createGraphiQLFetcher } from '@graphiql/toolkit';

type QueryExplorerType = {
  apiUrl: string;
  onQueryChange?: (query: string | undefined) => void;
  defaultQuery?: string;
};

export const QueryExplorer = ({
  apiUrl,
  onQueryChange,
  defaultQuery,
}: QueryExplorerType) => {
  const fetcher = createGraphiQLFetcher({
    url: apiUrl,
  });

  return (
    <GraphiQL
      fetcher={fetcher}
      onEditQuery={(query) => onQueryChange && onQueryChange(query)}
      defaultQuery={defaultQuery}
    />
  );
};
