import { Flex, Icon } from '@cognite/cogs.js';
import { URL_SEARCH_QUERY_PARAM } from 'common';
import { useFlowList } from 'hooks/raw';
import { filterFlow, useUrlQuery } from 'utils';
import ListItem from './ListItem';

export default function List() {
  const { data, isLoading, error } = useFlowList();
  const [query] = useUrlQuery(URL_SEARCH_QUERY_PARAM);
  if (isLoading) {
    return <Icon type="Loader" />;
  }
  if (error) {
    return (
      <div>
        <p>Error</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
  return (
    <Flex direction="column">
      {data
        ?.filter((flow) => filterFlow(flow, query))
        .map((flow) => (
          <ListItem key={flow.id} flow={flow} />
        ))}
    </Flex>
  );
}
