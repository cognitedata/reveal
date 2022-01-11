import { Label, Title } from '@cognite/cogs.js';
import { InterfaceTypeDefinitionNode } from 'graphql';
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
    <Label variant="warning" size="small">
      Interface
    </Label>
  </Header>
);
