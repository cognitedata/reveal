import { createLink } from '@cognite/cdf-utilities';
import { Flex, Icon } from '@cognite/cogs.js';
import { useFlowList } from 'hooks/raw';
import styled from 'styled-components';
import ListItem from './ListItem';

export default function List({}: {}) {
  const { data, isLoading, error } = useFlowList();
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
      {data?.map((flow) => (
        <ListItem key={flow.id} flow={flow} />
      ))}
    </Flex>
  );
}
