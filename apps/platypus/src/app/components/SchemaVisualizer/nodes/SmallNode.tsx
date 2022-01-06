import { Body, Title } from '@cognite/cogs.js';
import { ObjectTypeDefinitionNode } from 'graphql';
import { Header } from './Common';

export const SmallNode = ({ item }: { item: ObjectTypeDefinitionNode }) => (
  <Header>
    <Title level={5}>{item.name.value}</Title>
    <Body level={2}>[type]</Body>
  </Header>
);
