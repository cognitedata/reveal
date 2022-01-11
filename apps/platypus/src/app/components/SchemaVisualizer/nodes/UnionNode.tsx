import { Label, Title } from '@cognite/cogs.js';
import { UnionTypeDefinitionNode } from 'graphql';
import { Header } from './Common';

export const UnionNode = ({ item }: { item: UnionTypeDefinitionNode }) => (
  <Header>
    <Title level={5} style={{ flex: 1 }}>
      {item.name.value}
    </Title>
    <Label variant="warning" size="small">
      Union
    </Label>
  </Header>
);
