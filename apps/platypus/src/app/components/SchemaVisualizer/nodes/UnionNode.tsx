import { Body, Title } from '@cognite/cogs.js';
import { UnionTypeDefinitionNode } from 'graphql';
import { Header } from './Common';

export const UnionNode = ({ item }: { item: UnionTypeDefinitionNode }) => (
  <Header>
    <Title level={5}>{item.name.value}</Title>
    <Body level={2}>[union]</Body>
  </Header>
);
