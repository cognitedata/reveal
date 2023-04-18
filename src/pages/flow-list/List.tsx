import { Flex, Icon } from '@cognite/cogs.js';
import { URL_SEARCH_QUERY_PARAM } from 'common';
import { useFlowList } from 'hooks/files';
import { filterFlow, useUrlQuery } from 'utils';
import ListItem from './ListItem';

export default function List() {
  const { data, isLoading, error } = useFlowList({ staleTime: 0 });
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
        ?.filter((file) => filterFlow(file, query))
        .sort(
          (a, b) =>
            (b.uploadedTime?.valueOf() || 0) - (a.uploadedTime?.valueOf() || 0)
        )
        .map((file) => (
          <ListItem key={file.id} file={file} />
        ))}
    </Flex>
  );
}
