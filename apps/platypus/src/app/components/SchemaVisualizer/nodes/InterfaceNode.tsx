import { InterfaceTypeDefinitionNode } from 'graphql';

import { Chip, Title } from '@cognite/cogs.js';

import { Header } from './Common';

export const InterfaceNode = ({
  item,
}: {
  item: InterfaceTypeDefinitionNode;
}) => (
  <Header>
    <Title level={5} style={{ flex: 1 }}>
      {item.name.value}
    </Title>
    <Chip type="warning" size="small" label="Interface" />
  </Header>
);
