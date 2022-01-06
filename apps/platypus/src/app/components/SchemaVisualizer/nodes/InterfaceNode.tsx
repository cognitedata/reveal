import { Body, Title } from '@cognite/cogs.js';
import { InterfaceTypeDefinitionNode } from 'graphql';
import { Header } from './Common';

export const InterfaceNode = ({
  item,
}: {
  item: InterfaceTypeDefinitionNode;
}) => (
  <Header>
    <Title level={5}>{item.name.value}</Title>
    <Body level={2}>[interface]</Body>
  </Header>
);
