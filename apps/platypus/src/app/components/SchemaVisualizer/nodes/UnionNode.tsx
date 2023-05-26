import { UnionTypeDefinitionNode } from 'graphql';

import { Chip, Title } from '@cognite/cogs.js';

import { Header } from './Common';

export const UnionNode = ({ item }: { item: UnionTypeDefinitionNode }) => (
  <Header>
    <Title level={5} style={{ flex: 1 }}>
      {item.name.value}
    </Title>
    <Chip type="warning" size="small" label="Union" />
  </Header>
);
